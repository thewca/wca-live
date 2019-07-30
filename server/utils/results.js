const { average, best } = require('./calculations');
const { sortByArray } = require('./utils');
const { personById, parseActivityCode, eventById, acceptedPeople, nextRound, previousRound } = require('./wcif');
const { formatById } = require('./formats');
const { cloneRecords, recordId } = require('./records');
const { countryByIso2 } = require('./countries');

const setRankings = (results, formatId) => {
  const { sortBy } = formatById(formatId);
  rankingOrder = sortBy === 'best' ? ['best'] : ['average', 'best'];
  const cache = { average: {}, best: {} };

  results.forEach(result => result.ranking = null);
  results = results.filter(result =>
    result.attempts.some(({ result }) => result !== 0)
  );

  results.forEach(result => {
    const attempts = result.attempts.map(({ result }) => result);
    if (rankingOrder.includes('average')) {
      const avg = average(attempts);
      cache.average[result.personId] = avg > 0 ? avg : Infinity;
    }
    const bst = best(attempts);
    cache.best[result.personId] = bst > 0 ? bst : Infinity;
  });

  results = sortByArray(results, result =>
    rankingOrder.map(type => cache[type][result.personId])
  );

  results.reduce((prevResult, result, index) => {
    const tiedPrevious = prevResult && rankingOrder.every(
      type => cache[type][result.personId] === cache[type][prevResult.personId]
    );
    result.ranking = tiedPrevious ? prevResult.ranking : index + 1;
    return result;
  }, null);
};

const sortResults = (results, wcif) => {
  return sortByArray(results, result => [
    result.ranking ? result.ranking : Infinity,
    personById(wcif, result.personId).name,
  ]);
};

const tagsWithRecordId = (wcif, personId, eventId, type) => {
  const person = personById(wcif, personId);
  const country = countryByIso2(person.countryIso2);
  return [
    { tag: 'WR', recordId: recordId(eventId, type, 'world') },
    { tag: 'CR', recordId: recordId(eventId, type, country.continentId) },
    { tag: 'NR', recordId: recordId(eventId, type, country.id) },
    { tag: 'PB', recordId: recordId(eventId, type, person.registrantId) },
  ];
};

const setRecordTags = (round, wcif) => {
  const { eventId, roundNumber } = parseActivityCode(round.id);
  const event = eventById(wcif, eventId);
  const recordById = cloneRecords();
  /* Add personal records to recordById. */
  acceptedPeople(wcif).forEach(person => {
    person.personalBests.forEach(({ eventId, type, best }) => {
      recordById[recordId(eventId, type, person.registrantId)] = best;
    });
  });
  /* Updates recordById taking the given round results into account. */
  const updateRecords = round => {
    round.results.forEach(result => {
      const attempts = result.attempts.map(({ result }) => result);
      const stats = {
        single: best(attempts),
        average: average(attempts),
      };
      ['single', 'average'].forEach(type => {
        if (stats[type] > 0) {
          tagsWithRecordId(wcif, result.personId, eventId, type)
            .forEach(({ recordId }) => {
              recordById[recordId] = Math.min(recordById[recordId] || Infinity, stats[type]);
            });
        }
      });
    });
  };
  const previousRounds = event.rounds.filter(
    round => parseActivityCode(round.id).roundNumber < roundNumber
  );
  previousRounds.forEach(updateRecords);
  /* Changing result may affect records in current and further rounds. */
  const affectedRounds = event.rounds.filter(
    round => parseActivityCode(round.id).roundNumber >= roundNumber
  );
  affectedRounds.forEach(round => {
    updateRecords(round);
    round.results.forEach(result => {
      const attempts = result.attempts.map(({ result }) => result);
      const stats = {
        single: best(attempts),
        average: average(attempts),
      };
      result.recordTags = {};
      ['single', 'average'].forEach(type => {
        const tagWithRecordId = tagsWithRecordId(wcif, result.personId, eventId, type)
          .find(({ recordId }) => recordById[recordId] === stats[type]);
        result.recordTags[type] = tagWithRecordId ? tagWithRecordId.tag : null;
      });
    });
  });
};

const processRoundResults = (round, wcif) => {
  setRankings(round.results, round.format);
  round.results = sortResults(round.results, wcif);
  setRecordTags(round, wcif);
};

const satisfiesAdvancementCondition = (result, advancementCondition, resultCount) => {
  const { type, level } = advancementCondition;
  if (type === 'ranking') return result.ranking <= level;
  if (type === 'percent') return result.ranking <= Math.floor(resultCount * level * 0.01);
  if (type === 'attemptResult') return result.attempts.some(attempt => attempt.result > 0 && attempt.result < level);
  throw new Error(`Unrecognised AdvancementCondition type: '${type}'`);
};

const withAdvancableFromCondition = (results, advancementCondition) => {
  const complete = ({ attempts }) => attempts.some(({ result }) => result > 0);
  if (!advancementCondition) {
    /* Mark top 3 in the finals. */
    return results.map(result => ({
      ...result,
      advancable: complete(result) && !!result.ranking && result.ranking <= 3,
    }));
  } else {
    /* See: https://www.worldcubeassociation.org/regulations/#9p1 */
    const maxAdvanceable = Math.floor(results.length * 0.75);
    const maxRank = Math.max(...results.map(({ ranking }) => ranking).filter(x => x));
    const firstNonAdvancingRank = results[maxAdvanceable].ranking || maxRank + 1;
    return results.map(result => ({
      ...result,
      /* Note: this ensures that people who tied either advance altogether or not. */
      advancable: !!result.ranking && result.ranking < firstNonAdvancingRank
        && complete(result) && satisfiesAdvancementCondition(result, advancementCondition, results.length)
    }));
  }
};

const withAdvancable = (results, round, wcif) => {
  if (results.length === 0) return [];
  const next = nextRound(wcif, round.id);
  if (next && next.results.length > 0) {
    /* If the next round is open use its results to determine who advanced. */
    const advancedByPersonId = Object.fromEntries(
      next.results.map(result => [result.personId, true])
    );
    return results.map(result => ({
      ...result,
      advancable: advancedByPersonId[result.personId] || false,
    }));
  } else {
    return withAdvancableFromCondition(results, round.advancementCondition);
  }
};

const advancingPersonIds = (round, wcif) => {
  const { eventId, roundNumber } = parseActivityCode(round.id);
  if (roundNumber === 1) {
    const registeredPeople = acceptedPeople(wcif).filter(
      ({ registration }) => registration.eventIds.includes(eventId)
    );
    return registeredPeople.map(({ registrantId }) => registrantId);
  } else {
    const previousRound = eventById(wcif, eventId).rounds.find(
      ({ id }) => parseActivityCode(id).roundNumber === roundNumber - 1
    );
    return withAdvancable(previousRound.results, previousRound, wcif)
      .filter(({ advancable }) => advancable)
      .map(({ personId }) => personId);
  }
};

const emptyResultsForPeople = (personIds, solveCount) => {
  return personIds.map(personId => ({
    personId,
    ranking: null,
    attempts: [],
    recordTags: { single: null, average: null },
  }));
};

const openRound = (round, wcif) => {
  const format = formatById(round.format);
  /* Remove empty results from previous round, to correctly determine how many people to advance. */
  const previous = previousRound(wcif, round.id);
  if (previous) {
    previous.results = previous.results.filter(
      ({ attempts }) => attempts.length > 0
    );
  }
  /* TODO: validate whether the round actually can be open (?), see cubecomps populate.php */
  round.results = emptyResultsForPeople(advancingPersonIds(round, wcif), format.solveCount);
  round.results = sortResults(round.results, wcif);
};

/* Returns people who could advance to the given round if one person quit. */
const nextAdvancableToRound = (round, wcif) => {
  const previous = previousRound(wcif, round.id);
  if (!previous) return []; /* This is the first round, noone else could advance to it. */
  const previousResults = withAdvancable(previous.results, previous, wcif);
  const maxAdvancingRanking = Math.max(
    ...previousResults.filter(({ advancable }) => advancable).map(({ ranking }) => ranking)
  );
  /* For previous round results remove attempts of people
     who quitted the next round (gaps in advancable) and also for first advancable person.
     Empty attempts rank those people at the end (so we don't treat them as advancable).
     Then recompute rankings and see who else would advance as a result. */
  previousResults
    .filter(({ ranking }) => ranking <= maxAdvancingRanking) /* Should be advancable... */
    .filter(({ advancable }) => !advancable) /* ...but it's not, because it quitted the next round. */
    .forEach(result => result.attempts = []);
  const firstAdvancable = previousResults.find(({ advancable }) => advancable);
  if (!firstAdvancable) return [];
  firstAdvancable.attempts = [];
  const potentiallyAdvancingPersonIds = previousResults
    .filter(({ ranking }) => ranking > maxAdvancingRanking)
    .map(({ personId }) => personId);
  setRankings(previousResults, previous.format);
  const previousResultsWithoutQuitted =
    withAdvancableFromCondition(sortResults(previousResults, wcif), previous.advancementCondition);
  const wouldAdvancePersonIds = potentiallyAdvancingPersonIds.filter(
    personId => previousResultsWithoutQuitted.find(result => result.personId === personId).advancable
  );
  return wouldAdvancePersonIds.map(personId => personById(wcif, personId));
};

const quitCompetitor = (competitorId, replace, round, wcif) => {
  const advanced = round.results.some(
    result => result.personId === parseInt(competitorId, 10)
  );
  if (!advanced) {
    throw new Error(`Cannot quit competitor with id ${competitorId} as he's not in ${roundId}.`);
  }
  if (replace) {
    round.results.push(
      ...emptyResultsForPeople(
        nextAdvancableToRound(round, wcif).map(({ registrantId }) => registrantId)
      )
    );
  }
  round.results = round.results.filter(
    result => result.personId !== parseInt(competitorId, 10)
  );
  processRoundResults(round, wcif);
};

module.exports = {
  processRoundResults,
  openRound,
  setRecordTags,
  withAdvancable,
  nextAdvancableToRound,
  quitCompetitor,
};
