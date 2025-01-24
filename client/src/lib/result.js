import { orderBy } from "./utils";
import {
  projectedAverage,
  isComplete,
  isSkipped,
  padSkipped,
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
    round.advancementCondition === null;
}

export function resultProjectedAverage(result, format) {
  if (isComplete(result.average)) {
    return result.average;
  }
  return projectedAverage(result.attempts.map((attempt) => attempt.result), format);
}

/**
 * return the results object with additional properties:
 * projectedAverage: projected final average based on current results
 * forFirst: time needed to overtake first place
 * forThird: time needed to overtake third place
 */
export function resultsForView(results, format, forecastView) {
  console.log(results);
  if (results.length == 0 || !forecastView) return results;
  var resultsForView = results.map((result) => {
    return {
      ...result,
      projectedAverage: resultProjectedAverage(result, format),
    };
  });

  // Sort based on projection with tiebreakers on single
  resultsForView = orderBy(resultsForView, [
    (result) => toMonotonic(result.projectedAverage),
    (result) => toMonotonic(result.best),
  ]);

  if (isSkipped(resultsForView[0].projectedAverage)) {
    // First place has no results. Do nothing.
    return resultsForView;
  }

  resultsForView[0].ranking = 1;
  var prevResult = resultsForView[0];
  // Forecast view only supported for final rounds - advancing count hardcoded as 3
  const advancingCount = 3;
  for (let i = 0; i < resultsForView.length; i++) {
    let currentResult = resultsForView[i];
    if (currentResult.attempts.length > 0) {
      if (toMonotonic(currentResult.projectedAverage) === toMonotonic(prevResult.projectedAverage) &&
        toMonotonic(currentResult.best) === toMonotonic(prevResult.best)) {
        // Rankings tie
        currentResult.ranking = prevResult.ranking;
      } else {
        currentResult.ranking = i + 1;
      }
      const isClinched = currentResult.advancing && !currentResult.advancingQuestionable;
      // A clinched result must still be clinched in the projected ranking,
      // so we keep advancing state as is
      if (!isClinched) {
        if (currentResult.ranking <= advancingCount) {
          currentResult.advancing = true;
          currentResult.advancingQuestionable = true;
        } else {
          currentResult.advancing = false;
          currentResult.advancingQuestionable = false;
        }
      }
    }
    else {
      currentResult.advancing = false;
      currentResult.advancingQuestionable = false;
    }
    prevResult = currentResult;
  }

  return resultsForView;
}
