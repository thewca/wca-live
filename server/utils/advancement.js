const { parseActivityCode, eventById, roundById, acceptedPeople, nextRound, previousRound } = require('./wcif');
const { updateRanking } = require('./results');

const satisfiesAdvancementCondition = (result, advancementCondition, resultCount) => {
  const { type, level } = advancementCondition;
  if (type === 'ranking') {
    return result.ranking <= level;
  }
  if (type === 'percent') {
    return result.ranking <= Math.floor(resultCount * level * 0.01);
  }
  if (type === 'attemptResult') {
    return result.best > 0 && result.best < level;
  }
  throw new Error(`Unrecognised AdvancementCondition type: '${type}'`);
};

const advancingResultsFromCondition = (results, advancementCondition) => {
  if (results.length === 0) return [];
  if (!advancementCondition) {
    /* Mark top 3 in the finals. */
    return results.filter(
      result => result.best > 0 && result.ranking && result.ranking <= 3,
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
      && result.best > 0
      && satisfiesAdvancementCondition(result, advancementCondition, results.length)
    );
  }
};

const advancingResults = (round, wcif) => {
  const next = nextRound(wcif, round.id);
  if (next && next.results.length > 0) {
    /* If the next round is open use its results to determine who advanced. */
    const advancedPersonIds = next.results.map(result => result.personId);
    return round.results.filter(result => advancedPersonIds.includes(result.personId));
  } else {
    return advancingResultsFromCondition(round.results, round.advancementCondition);
  }
};

const personIdsForRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  if (roundNumber === 1) {
    const registeredPeople = acceptedPeople(wcif).filter(
      ({ registration }) => registration.eventIds.includes(eventId)
    );
    return registeredPeople.map(({ registrantId }) => registrantId);
  } else {
    const previous = previousRound(wcif, roundId);
    return advancingResults(previous, wcif).map(({ personId }) => personId);
  }
};

/**
 * Returns ids of people who would advance from the given round
 * if we ignored the specified people (i.e. intentionally not advance them).
 */
const advancingIdsIgnoring = (round, ignoredIds) => {
  const { results, format, advancementCondition } = round;
  /* Empty attempts rank ignored people at the end (making sure they don't advance).
     Then recompute rankings and see who would advance as a result. */
  const hypotheticalResults = results.map(result =>
    ignoredIds.includes(result.personId)
      ? { ...result, attempts: [], best: 0, average: 0 }
      : result
  );
  const withHypoteticalRanking = updateRanking(hypotheticalResults, format);
  return advancingResultsFromCondition(withHypoteticalRanking, advancementCondition)
    .map(({ personId }) => personId);
};

const alreadyQuitResults = (results, advancingResults) => {
  const maxAdvancingRanking = Math.max(
    ...advancingResults.map(result => result.ranking)
  );
  return results
    .filter(result => result.ranking <= maxAdvancingRanking) /* Should advance... */
    .filter(result => !advancingResults.includes(result)); /* ...but didn't, because they quit the next round. */
};

/**
 * Returns ids of people who could advance to the given round if one person quit.
 */
const nextAdvancableToRound = (wcif, roundId) => {
  const previous = previousRound(wcif, roundId);
  if (!previous) return []; /* This is the first round, noone else could advance to it. */
  const currentlyAdvancing = advancingResults(previous, wcif);
  if (currentlyAdvancing.length === 0) {
    /* This is only possible if the given round has no results (not open yet)
       and no one from the previous round satisfies the advancement condition.
       In that case there is no one who could advance. */
    return [];
  }
  const alreadyQuit = alreadyQuitResults(previous.results, currentlyAdvancing);
  const candidateIdsToAdvance = previous.results
    .filter(result =>
      !currentlyAdvancing.includes(result) && !alreadyQuit.includes(result)
    )
    .map(result => result.personId);
  const firstAdvancable = currentlyAdvancing[0];
  /* For previous round results ignore people who have already quit the next round
     and also the first advancable person to see who else would advance. */
  const ignoredIds = [...alreadyQuit, firstAdvancable].map(result => result.personId);
  return advancingIdsIgnoring(previous, ignoredIds)
    .filter(personId => candidateIdsToAdvance.includes(personId));
};

/**
 * Returns an object with:
 * - qualifyingIds - people who qualify to the given round, but are not in it
 * - excessIds - people who would be removed if one qualifying person was added to the given round
 */
const missingQualifyingIds = (wcif, roundId) => {
  const previous = previousRound(wcif, roundId);
  if (!previous) {
    /* Anyone qualifies to the first round. */
    const round = roundById(wcif, roundId);
    const qualifyingIds = acceptedPeople(wcif)
      .filter(person => !round.results.some(result => result.personId === person.registrantId))
      .map(person => person.registrantId);
    return { qualifyingIds, excessIds: [] };
  } else {
    const currentlyAdvancing = advancingResults(previous, wcif);
    const alreadyQuitIds = alreadyQuitResults(previous.results, currentlyAdvancing)
      .map(result => result.personId);
    const couldJustAdvanceIds = advancingIdsIgnoring(previous, alreadyQuitIds)
      .filter(personId => !currentlyAdvancing.some(result => result.personId === personId));
    if (couldJustAdvanceIds.length > 0) {
      /* If someone could just advance it means there's a free spot. */
      return { qualifyingIds: [...alreadyQuitIds, ...couldJustAdvanceIds], excessIds: [] };
    } else if (alreadyQuitIds.length > 0) {
      /* See who wouldn't advance if we un-quit one person. */
      const newAdvancingIds = advancingIdsIgnoring(previous, alreadyQuitIds.slice(1));
      const excessIds = currentlyAdvancing
        .filter(result => !newAdvancingIds.includes(result.personId))
        .map(result => result.personId);
      return { qualifyingIds: alreadyQuitIds, excessIds };
    } else {
      /* Everyone qualifying is already in the round. */
      return { qualifyingIds: [], excessIds: [] };
    }
  }
};

module.exports = {
  advancingResultsFromCondition,
  advancingResults,
  personIdsForRound,
  nextAdvancableToRound,
  missingQualifyingIds,
};
