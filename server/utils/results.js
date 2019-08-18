const { average, best } = require('./calculations');
const { sortByArray, partition } = require('./utils');
const {
  parseActivityCode,
  personById,
  eventById,
  roundById,
  acceptedPeople,
  nextRound,
  previousRound,
  updateEvent,
  updateRound,
} = require('./wcif');
const { formatById } = require('./formats');
const { getRecordByIdCopy, recordId } = require('./records');
const { countryByIso2 } = require('./countries');

const updateRanking = (results, formatId) => {
  const { sortBy } = formatById(formatId);
  const rankingOrder = sortBy === 'best' ? ['best'] : ['average', 'best'];

  const [completed, empty] = partition(results, ({ attempts }) => attempts.length > 0);

  const sortedResults = sortByArray(completed, result =>
    rankingOrder.map(type => result[type] > 0 ? result[type] : Infinity)
  );

  const completedWithRanking = sortedResults.reduce((results, result, index) => {
    const prevResult = results[index - 1];
    const tiedPrevious = prevResult && rankingOrder.every(
      type => result[type] === prevResult[type]
    );
    const resultWithRanking = {
      ...result,
      ranking: tiedPrevious ? prevResult.ranking : index + 1
    };
    return [...results, resultWithRanking];
  }, []);
  const emptyWithRanking = empty.map(result => ({ ...result, ranking: null }));
  return [...completedWithRanking, ...emptyWithRanking];
};

const sortedResults = (results, wcif) => {
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

const updateRecordTags = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  const event = eventById(wcif, eventId);
  const recordById = getRecordByIdCopy();
  /* Add personal records to recordById. */
  acceptedPeople(wcif).forEach(person => {
    person.personalBests.forEach(({ eventId, type, best }) => {
      recordById[recordId(eventId, type, person.registrantId)] = best;
    });
  });
  /* Updates recordById taking the given round results into account. */
  const updateRecords = round => {
    round.results.forEach(result => {
      const stats = {
        single: result.best,
        average: result.average,
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
  /* Changing result may affect records in the given and further rounds. */
  const [previousRounds, affectedRounds] = partition(
    event.rounds,
    round => parseActivityCode(roundId).roundNumber < roundNumber
  );
  previousRounds.forEach(updateRecords);
  const updatedAffectedRounds = affectedRounds.map(round => {
    updateRecords(round);
    const results = round.results.map(result => {
      const stats = {
        single: result.best,
        average: result.average,
      };
      const recordTags = {};
      ['single', 'average'].forEach(type => {
        const tagWithRecordId = tagsWithRecordId(wcif, result.personId, eventId, type)
          .find(({ recordId }) => recordById[recordId] === stats[type]);
        recordTags[type] = tagWithRecordId ? tagWithRecordId.tag : null;
      });
      return { ...result, recordTags };
    });
    return { ...round, results };
  });
  const updatedEvent = { ...event, rounds: [...previousRounds, ...updatedAffectedRounds] };
  return updateEvent(wcif, updatedEvent);
};

const processRoundChange = (wcif, roundId) => {
  const round = roundById(wcif, roundId);
  const withRanks = updateRanking(round.results, round.format);
  const sorted = sortedResults(withRanks, wcif);
  const updatedWcif = updateRound(wcif, { ...round, results: sorted });
  return updateRecordTags(updatedWcif, roundId);
};

const updateResult = (wcif, roundId, personId, attempts) => {
  const round = roundById(wcif, roundId);
  const attemptResults = attempts.map(({ result }) => result);
  const updatedWcif = updateRound(wcif, {
    ...round,
    results: round.results.map(current =>
      current.personId === personId
        ? {
          ...current,
          attempts,
          best: best(attemptResults),
          average: average(attemptResults),
          updatedAt: new Date(),
        }
        : current
    ),
  });
  return processRoundChange(updatedWcif, roundId);
};

const satisfiesAdvancementCondition = (result, advancementCondition, resultCount) => {
  const { type, level } = advancementCondition;
  if (type === 'ranking') {
    return result.ranking <= level;
  }
  if (type === 'percent') {
    return result.ranking <= Math.floor(resultCount * level * 0.01);
  }
  if (type === 'attemptResult') {
    return result.attempts.some(attempt => attempt.result > 0 && attempt.result < level);
  }
  throw new Error(`Unrecognised AdvancementCondition type: '${type}'`);
};

const advancingResultsFromCondition = (results, advancementCondition) => {
  if (results.length === 0) return [];
  const complete = ({ attempts }) => attempts.some(({ result }) => result > 0);
  if (!advancementCondition) {
    /* Mark top 3 in the finals. */
    return results.filter(
      result => complete(result) && result.ranking && result.ranking <= 3,
    );
  } else {
    /* See: https://www.worldcubeassociation.org/regulations/#9p1 */
    const maxAdvanceable = Math.floor(results.length * 0.75);
    const rankings = results.map(({ ranking }) => ranking).filter(x => x).sort((x, y) => x - y);
    const firstNonAdvancingRanking =
      rankings.length > maxAdvanceable
        ? rankings[maxAdvanceable]
        : rankings[rankings.length - 1] + 1;
    return results.filter(result =>
      result.ranking
      /* Note: this ensures that people who tied either advance together or not. */
      && result.ranking < firstNonAdvancingRanking
      && complete(result)
      && satisfiesAdvancementCondition(result, advancementCondition, results.length)
    );
  }
};

const advancingResults = (results, round, wcif) => {
  const next = nextRound(wcif, round.id);
  if (next && next.results.length > 0) {
    /* If the next round is open use its results to determine who advanced. */
    const advancedByPersonId = Object.fromEntries(
      next.results.map(result => [result.personId, true])
    );
    return results.filter(result => advancedByPersonId[result.personId]);
  } else {
    return advancingResultsFromCondition(results, round.advancementCondition);
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
    return advancingResults(previousRound.results, previousRound, wcif)
      .map(({ personId }) => personId);
  }
};

const emptyResultsForPeople = personIds => {
  return personIds.map(personId => ({
    personId,
    ranking: null,
    attempts: [],
    best: 0,
    average: 0,
    recordTags: { single: null, average: null },
    updatedAt: new Date(),
  }));
};

const openRound = (wcif, roundId) => {
  const round = roundById(wcif, roundId);
  const previous = previousRound(wcif, roundId);
  if (previous) {
    /* Remove empty results from previous round, to correctly determine how many people to advance. */
    const previousResults = previous.results.filter(
      ({ attempts }) => attempts.length > 0
    );
    if (previousResults.length < 8) {
      throw new Error('Cannot open this round as the previous has less than 8 competitors.');
    }
    wcif = updateRound(wcif, { ...previous, results: previousResults });
  }
  const advancingIds = advancingPersonIds(round, wcif);
  if (advancingIds.length === 0) {
    throw new Error(`Cannot open this round as no one ${previous ? 'qualified' : 'registered'}.`);
  }
  const results = sortedResults(emptyResultsForPeople(advancingIds), wcif);
  return updateRound(wcif, { ...round, results });
};

const clearRound = (wcif, roundId) => {
  const round = roundById(wcif, roundId);
  return updateRound(wcif, { ...round, results: [] });
};

/* Returns ids of people who could advance to the given round if one person quit. */
const nextAdvancableToRound = (wcif, roundId) => {
  const previous = previousRound(wcif, roundId);
  if (!previous) return []; /* This is the first round, noone else could advance to it. */
  const currentlyAdvancing = advancingResults(previous.results, previous, wcif);
  const maxAdvancingRanking = Math.max(
    ...currentlyAdvancing.map(({ ranking }) => ranking)
  );
  const hasntAdvancedYetIds = previous.results
    .filter(({ ranking }) => ranking > maxAdvancingRanking)
    .map(({ personId }) => personId);
  /* For previous round results ignore people who have already quit the next round
     and also the first advancable person (by clearing their attempts).
     Empty attempts rank those people at the end (so we don't treat them as advancing).
     Then recompute rankings and see who else would advance as a result. */
  const alreadyQuitIds = previous.results
    .filter(({ ranking }) => ranking <= maxAdvancingRanking) /* Should advance... */
    .filter(result => !currentlyAdvancing.includes(result)) /* ...but didn't, because they quit the next round. */
    .map(({ personId }) => personId);
  const firstAdvancable = currentlyAdvancing[0];
  const ignoredIds = firstAdvancable
    ? [...alreadyQuitIds, firstAdvancable.personId]
    : alreadyQuitIds;
  /* Hypothetical -> ignored people end up at the end. */
  const hypotheticalPreviousResults = previous.results.map(result =>
    ignoredIds.includes(result.personId) ? { ...result, attempts: [] } : result
  );
  const withHypoteticalRanking = updateRanking(hypotheticalPreviousResults, previous.format);
  const newAdvancing = advancingResultsFromCondition(withHypoteticalRanking, previous.advancementCondition);
  return newAdvancing
    .filter(result => hasntAdvancedYetIds.includes(result.personId))
    .map(({ personId }) => personId);
};

const quitCompetitor = (wcif, roundId, competitorId, replace) => {
  const round = roundById(wcif, roundId);
  const advanced = round.results.some(
    result => result.personId === competitorId
  );
  if (!advanced) {
    throw new Error(`Cannot quit competitor with id ${competitorId} as he's not in ${roundId}.`);
  }
  const replacingResults = replace
    ? emptyResultsForPeople(nextAdvancableToRound(wcif, round.id))
    : [];
  const results = round.results
    .filter(result => result.personId !== competitorId)
    .concat(replacingResults);
  const updatedWcif = updateRound(wcif, { ...round, results });
  return processRoundChange(updatedWcif, round.id);
};

module.exports = {
  updateRanking,
  updateResult,
  openRound,
  clearRound,
  advancingResults,
  nextAdvancableToRound,
  quitCompetitor,
};
