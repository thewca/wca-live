const { average, best } = require('./stats');
const { sortByArray, partition } = require('./utils');
const {
  parseActivityCode,
  personById,
  eventById,
  roundById,
  acceptedPeople,
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

/* Updates record tags for the given round and all further rounds
   (as change to the given round may affect further ones). */
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
    round => parseActivityCode(round.id).roundNumber < roundNumber
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
  const { solveCount } = formatById(round.format);
  const { eventId } = parseActivityCode(roundId);
  const attemptResults = attempts.map(({ result }) => result);
  const updatedWcif = updateRound(wcif, {
    ...round,
    results: round.results.map(current =>
      current.personId === personId
        ? {
          ...current,
          attempts,
          best: best(attemptResults),
          average: average(attemptResults, eventId, solveCount),
          updatedAt: new Date(),
        }
        : current
    ),
  });
  return processRoundChange(updatedWcif, roundId);
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

module.exports = {
  updateRanking,
  updateRecordTags,
  sortedResults,
  processRoundChange,
  updateResult,
  emptyResultsForPeople,
};
