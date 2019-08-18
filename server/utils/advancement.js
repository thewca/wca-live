const { parseActivityCode, eventById, acceptedPeople, nextRound, previousRound } = require('./wcif');
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

const personIdsForRound = (round, wcif) => {
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
    return advancingResults(previousRound, wcif)
      .map(({ personId }) => personId);
  }
};

/* Returns ids of people who could advance to the given round if one person quit. */
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
  const ignoredIds = [...alreadyQuitIds, firstAdvancable.personId]
  /* Hypothetical -> ignored people end up at the end. */
  const hypotheticalPreviousResults = previous.results.map(result =>
    ignoredIds.includes(result.personId)
      ? { ...result, attempts: [], best: 0, average: 0 }
      : result
  );
  const withHypoteticalRanking = updateRanking(hypotheticalPreviousResults, previous.format);
  const newAdvancing = advancingResultsFromCondition(withHypoteticalRanking, previous.advancementCondition);
  return newAdvancing
    .filter(result => hasntAdvancedYetIds.includes(result.personId))
    .map(({ personId }) => personId);
};

module.exports = {
  advancingResultsFromCondition,
  advancingResults,
  personIdsForRound,
  nextAdvancableToRound,
};
