const { roundById, previousRound, nextRound, updateRound } = require('./wcif');
const { personIdsForRound, nextAdvancableToRound } = require('./advancement');
const { processRoundChange, sortedResults, emptyResultsForPeople } = require('./results');

const roundName = (roundNumber, numberOfRounds, cutoff) => {
  if (roundNumber === numberOfRounds) {
    return cutoff ? 'Combined Final' : 'Final';
  }
  if (roundNumber === 1) {
    return cutoff ? 'Combined First' : 'First Round';
  }
  if (roundNumber === 2) {
    return cutoff ? 'Combined Second' : 'Second Round';
  }
  if (roundNumber === 3) {
    return cutoff ? 'Combined Third' : 'Semi Final'
  }
  return null;
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
      throw new Error('Cannot open this round as the previous has less than 8 competitors.');
    }
    wcif = updateRound(wcif, { ...previous, results: previousResults });
  }
  const personIds = personIdsForRound(wcif, round.id);
  if (personIds.length === 0) {
    throw new Error(`Cannot open this round as no one ${previous ? 'qualified' : 'registered'}.`);
  }
  const results = sortedResults(emptyResultsForPeople(personIds), wcif);
  return updateRound(wcif, { ...round, results });
};

const clearRound = (wcif, roundId) => {
  const next = nextRound(wcif, roundId);
  if (next.results.length > 0) {
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
  roundName,
  openRound,
  clearRound,
  quitCompetitor,
};
