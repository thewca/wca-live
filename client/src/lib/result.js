import { orderBy } from "./utils";
import {
  computeProjectedAverage,
  isSkipped,
  padSkipped,
  SKIPPED_VALUE,
  toMonotonic
} from "./attempt-result";

/**
 * Returns a list of objects corresponding to result statistics - best and average.
 * The first statistic is the one that determines the ranking.
 * This is a common logic used in all result tables/dialogs.
 */
export function orderedResultStats(eventId, format) {
  const { numberOfAttempts, sortBy } = format;

  if (!shouldComputeAverage(eventId, numberOfAttempts)) {
    return [{ name: "Best", field: "best", recordTagField: "singleRecordTag" }];
  }

  const stats = [
    { name: "Best", field: "best", recordTagField: "singleRecordTag" },
    {
      name: numberOfAttempts === 3 ? "Mean" : "Average",
      field: "average",
      recordTagField: "averageRecordTag",
    },
  ];
  return sortBy === "best" ? stats : stats.reverse();
}

/**
 * Checks if an average should be calculated in case of the given event and format.
 */
export function shouldComputeAverage(eventId, numberOfAttempts) {
  if (eventId === "333mbf") return false;
  return [3, 5].includes(numberOfAttempts);
}

/**
 * Return a list of result's attempt results.
 * The list is normalized to have the specified length,
 * optionally filled with empty attempt results.
 */
export function paddedAttemptResults(result, numberOfAttempts) {
  const attemptResults = result.attempts.map((attempt) => attempt.result);
  return padSkipped(attemptResults, numberOfAttempts);
}

// Events sorted by best don't need forecast view.
// Fewest moves is currently unsupported
// Only final rounds are supported
export function forecastViewEnabled(round) {
  return round.format.sortBy != "best" &&
    round.competitionEvent.event.id != "333fm" &&
    round.name === "Final";
}

/**
 * return the results object with additional properties:
 * projectedAverage: projected final average based on current results
 * forFirst: time needed to overtake first place
 * forThird: time needed to overtake third place
 */
export function resultsForView(results, format, forecastView, advancementCondition) {
  if (results.length == 0 || !forecastView) return results;
  var resultsForView = results.map((result) => {
    return {
      ...result,
      projectedAverage: computeProjectedAverage(result, format),
    };
  });

  if (resultsForView[0].projectedAverage == SKIPPED_VALUE) {
    // First place has no results. Do nothing.
    return resultsForView;
  }

  for (let result of resultsForView) {
    result.advancingQuestionable = false;
  }

  // Forecast view only supported for final rounds - advancing count hardcoded as 3
  const advancingCount = 3;
  const roundIncomplete = results.some((result) => isSkipped(result.average));

  // Sort based on projection with tiebreakers on single
  resultsForView = orderBy(resultsForView, [
    (result) => toMonotonic(result.projectedAverage),
    (result) => toMonotonic(result.best),
  ]);
  resultsForView[0].ranking = 1;
  var prevResult = resultsForView[0];
  for (let i = 0; i < resultsForView.length; i++) {
    let currentResult = resultsForView[i];
    if (isSkipped(currentResult.projectedAverage)) {
      break;
    }
    if (currentResult.projectedAverage === prevResult.projectedAverage &&
      currentResult.best === prevResult.best) {
      // Rankings tie
      currentResult.ranking = prevResult.ranking;
    } else {
      currentResult.ranking = i + 1;
    }
    if (currentResult.ranking <= advancingCount) {
      if (roundIncomplete) {
        currentResult.advancingQuestionable = true;
      } else {
        currentResult.advancing = true;
      }
    }
    prevResult = currentResult;
  }

  return resultsForView;
}