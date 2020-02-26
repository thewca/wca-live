const { roundById, previousRound, nextRound, updateRound } = require('./wcif');
const {
  personIdsForRound,
  nextQualifyingToRound,
  missingQualifyingIds,
} = require('./advancement');
const {
  processRoundChange,
  sortedResults,
  emptyResultsForPeople,
  resultFinished,
} = require('./results');
const { formatById } = require('./formats');
const { flatMap } = require('./utils');

const friendlyRoundName = (roundNumber, numberOfRounds) => {
  if (roundNumber === numberOfRounds) {
    return 'Final';
  }
  if (roundNumber === 1) {
    return 'First Round';
  }
  if (roundNumber === 2) {
    return 'Second Round';
  }
  if (roundNumber === 3) {
    return 'Third Round';
  }
  return null;
};

const roundLabel = round => {
  const recordTags = flatMap(round.results, result =>
    Object.values(result.recordTags)
  ).filter(tag => tag && tag !== 'PB');
  if (recordTags.length > 0) {
    return ['WR', 'CR', 'NR'].find(tag => recordTags.includes(tag));
  }
  if (roundFinished(round)) {
    return 'Done';
  }
  if (roundActive(round)) {
    return 'Live';
  }
  return null;
};

/**
 * Returns whether the round is finished.
 * A round is considered finished if all results have the expected
 * number of attempts (taking cutoff into account)
 * or less than 10% of results is missing and the round is inactive.
 */
const roundFinished = round => {
  if (round.results.length === 0) return false;
  const { solveCount } = formatById(round.format);
  const { cutoff } = round;
  const unfinishedResults = round.results.filter(
    result => !resultFinished(result, solveCount, cutoff)
  );
  return (
    unfinishedResults.length === 0 ||
    (unfinishedResults.length < Math.floor(0.1 * round.results.length) &&
      !roundActive(round))
  );
};

const roundActive = round => {
  /* Treat the competition as active if there were several updates in the past 15 minutes. */
  const recentUpdates = round.results
    .filter(result => result.attempts.length > 0)
    .map(result => result.updatedAt)
    .filter(updatedAt => updatedAt > new Date(Date.now() - 15 * 60 * 1000));
  return recentUpdates.length >= 3;
};

const openRound = (wcif, roundId) => {
  const round = roundById(wcif, roundId);
  if (round.results.length > 0) {
    throw new Error('Cannot open this round as it is already open.');
  }
  const previous = previousRound(wcif, roundId);
  if (previous) {
    /* Remove empty results from previous round, to correctly determine how many people to advance. */
    const previousResults = previous.results.filter(
      ({ attempts }) => attempts.length > 0
    );
    if (previousResults.length < 8) {
      /* See: https://www.worldcubeassociation.org/regulations/#9m3 */
      throw new Error(
        'Cannot open this round as the previous has less than 8 competitors.'
      );
    }
    wcif = updateRound(wcif, { ...previous, results: previousResults });
  }
  const personIds = personIdsForRound(wcif, round.id);
  if (personIds.length === 0) {
    throw new Error(
      `Cannot open this round as no one ${
        previous ? 'qualified' : 'registered'
      }.`
    );
  }
  const results = sortedResults(emptyResultsForPeople(personIds), wcif);
  return updateRound(wcif, { ...round, results });
};

const clearRound = (wcif, roundId) => {
  const next = nextRound(wcif, roundId);
  if (next && next.results.length > 0) {
    throw new Error('Cannot clear this round as the next round is open.');
  }
  const round = roundById(wcif, roundId);
  return updateRound(wcif, { ...round, results: [] });
};

const quitCompetitor = (wcif, roundId, competitorId, replace) => {
  const round = roundById(wcif, roundId);
  const advanced = round.results.some(
    result => result.personId === competitorId
  );
  if (!advanced) {
    throw new Error(
      `Cannot quit competitor with id ${competitorId} as he's not in ${roundId}.`
    );
  }
  const replacingResults = replace
    ? emptyResultsForPeople(nextQualifyingToRound(wcif, round.id))
    : [];
  const results = round.results
    .filter(result => result.personId !== competitorId)
    .concat(replacingResults);
  const updatedWcif = updateRound(wcif, { ...round, results });
  return processRoundChange(updatedWcif, round.id);
};

const addCompetitor = (wcif, roundId, competitorId) => {
  const round = roundById(wcif, roundId);
  const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, roundId);
  if (!qualifyingIds.includes(competitorId)) {
    throw new Error(
      `Cannot add competitor with id ${competitorId} as he doesn't qualify to ${roundId}.`
    );
  }
  const results = round.results
    .filter(result => !excessIds.includes(result.personId))
    .concat(emptyResultsForPeople([competitorId]));
  const updatedWcif = updateRound(wcif, { ...round, results });
  return processRoundChange(updatedWcif, round.id);
};

/**
 * Returns finished final rounds with podium results only.
 */
const podiums = wcif => {
  const finals = wcif.events
    .filter(event => event.rounds.length > 0)
    .map(event => event.rounds[event.rounds.length - 1])
    .filter(roundFinished);
  const withTop3Results = finals.map(round => ({
    ...round,
    results: round.results.filter(
      result => result.best > 0 && result.ranking && result.ranking <= 3
    ),
  }));
  return withTop3Results.filter(round => round.results.length > 0);
};

module.exports = {
  friendlyRoundName,
  roundLabel,
  roundFinished,
  roundActive,
  openRound,
  clearRound,
  quitCompetitor,
  addCompetitor,
  podiums,
};
