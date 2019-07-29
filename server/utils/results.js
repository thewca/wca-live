const { average, best } = require('./calculations');
const { sortByArray } = require('./utils');
const { personById, parseActivityCode, eventById, acceptedPeople, nextRound } = require('./wcif');
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

const withAdvancable = (round, wcif) => {
  const { advancementCondition } = round;
  const results = round.results.map(result => ({ ...result })); /* Work on results copy. */
  const next = nextRound(wcif, round.id);
  if (next && next.results.length > 0) {
    /* If the next round is open use its results to determine who advanced. */
    const advancedByPersonId = Object.fromEntries(
      next.results.map(result => [result.personId, true])
    );
    results.forEach(result => {
      result.advancable = advancedByPersonId[result.personId] || false;
    });
  } else {
    results.forEach(result => result.advancable = false);
    if (!advancementCondition) {
      /* Mark top 3 in the finals. */
      results
        .filter(({ ranking }) => ranking && ranking <= 3)
        .forEach(result => result.advancable = true);
    } else {
      /* See: https://www.worldcubeassociation.org/regulations/#9p1 */
      const maxAdvanceable = Math.floor(results.length * 0.75);
      const maxRank = Math.max(...results.map(({ ranking }) => ranking).filter(x => x));
      const firstNonAdvancingRank = results[maxAdvanceable].ranking || maxRank + 1;
      results
        /* Note: this ensures that people who tied either advance altogether or not. */
        .filter(({ ranking }) => ranking && ranking < firstNonAdvancingRank)
        .filter(result => satisfiesAdvancementCondition(result, advancementCondition, results.length))
        .forEach(result => result.advancable = true);
    }
  }
  return { ...round, results };
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
    return withAdvancable(previousRound, wcif).results
      .filter(({ advancable }) => advancable)
      .map(({ personId }) => personId);
  }
};

const openRound = (round, wcif) => {
  const format = formatById(round.format);
  /* TODO: validate whether the round actually can be open (?), see cubecomps populate.php */
  round.results = advancingPersonIds(round, wcif).map(personId => ({
    personId,
    ranking: null,
    attempts: Array.from({ length: format.solveCount }, () => ({ result: 0 })),
    recordTags: { single: null, average: null },
  }));
  round.results = sortResults(round.results, wcif);
};

module.exports = {
  processRoundResults,
  openRound,
  setRecordTags,
  withAdvancable,
};
