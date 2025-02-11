import { orderBy } from "./utils";
import {
  sum,
  projectedAverage,
  padSkipped,
  toMonotonic,
  isSkipped,
  isComplete,
  SKIPPED_VALUE,
  NA_VALUE,
  DNF_VALUE,
} from "./attempt-result";

/**
 * Returns a list of objects corresponding to result statistics - best and average.
 * The first statistic is the one that determines the ranking.
 * This is a common logic used in all result tables/dialogs.
 */
export function orderedResultStats(eventId, format, forecastView = null) {
  const { numberOfAttempts, sortBy } = format;

  if (!shouldComputeAverage(eventId, numberOfAttempts)) {
    return [{ name: "Best", field: "best", recordTagField: "singleRecordTag" }];
  }

  var stats = stats = [
    { name: "Best", field: "best", recordTagField: "singleRecordTag" },
    {
      name: numberOfAttempts === 3 ? "Mean" : "Average",
      field: "average",
      recordTagField: "averageRecordTag",
    },
  ];
  stats = sortBy === "best" ? stats : stats.reverse();
  if (forecastView) {
    stats.push({
      name: "For 1st",
      field: "forFirst",
    })
    stats.push({
      name: "For 3rd",
      field: "forThird",
    })
  }
  return stats;
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

/**
 * Checks if forecast view is supported for the given round.
 */
export function forecastViewSupported(round) {
  return (
    // Only relevant for rounds sorted by average
    round.format.sortBy != "best" &&
    // Fewest moves is currently not supported
    round.competitionEvent.event.id != "333fm" // &&
    // Currently only final rounds are supported. It is the most likely
    // use case and this way we don't need to replicate advancement
    // condition and clinching logic on the client.
    // round.advancementCondition === null
  );
}

/**
 * Returns results, optionally adding extra fields.
 *
 * When the forecast view is enabled, adds the following fields:
 *
 *  * `projectedAverage` - average projection based on the current
 *    attempts, if any
 *
 */
export function resultsForView(results, format, forecastView) {
  if (results.length == 0 || !forecastView) return results;

  let resultsForView = results.map((result) => {
    return {
      ...result,
      projectedAverage: resultProjectedAverage(result, format),
      forFirst: SKIPPED_VALUE,
      forThird: SKIPPED_VALUE,
    };
  });

  // Sort based on projection with tiebreakers on single
  resultsForView = orderBy(resultsForView, [
    (result) => toMonotonic(result.projectedAverage),
    (result) => toMonotonic(result.best),
  ]);

  if (resultsForView[0].attempts.length === 0) {
    return resultsForView;
  }

  // Forecast view only supported for final rounds - advancing count hardcoded as 3
  const advancingCount = 3;

  resultsForView[0].ranking = 1;
  let prevResult = resultsForView[0];

  for (let i = 0; i < resultsForView.length; i++) {
    let currentResult = resultsForView[i];

    if (currentResult.attempts.length === 0) {
      // From this point forward all results are empty, so we are done
      break;
    }

    if (
      toMonotonic(currentResult.projectedAverage) ===
      toMonotonic(prevResult.projectedAverage) &&
      toMonotonic(currentResult.best) === toMonotonic(prevResult.best)
    ) {
      // Rankings tie
      currentResult.ranking = prevResult.ranking;
    } else {
      currentResult.ranking = i + 1;
    }

    const isClinched =
      currentResult.advancing && !currentResult.advancingQuestionable;

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

    prevResult = currentResult;
  }

  const secondComplete = resultsForView.length > 1 && isComplete(resultsForView[1].projectedAverage);
  const fourthComplete = resultsForView.length > 3 && isComplete(resultsForView[3].projectedAverage);
  if (secondComplete) {
    for (let i = 0; i < resultsForView.length; i++) {
      var result = resultsForView[i];
      if (isSkipped(result.projectedAverage)) {
        break;
      }
      if (isSkipped(result.average)) {
        var firstIndex = i == 0 ? 1 : 0;
        result.forFirst = timeNeededToOvertake(result, format, resultsForView[firstIndex].projectedAverage, resultsForView[firstIndex].best);
        if (fourthComplete) {
          var thirdIndex = i < 3 ? 3 : 2;
          result.forThird = timeNeededToOvertake(result, format, resultsForView[thirdIndex].projectedAverage, resultsForView[thirdIndex].best);
        }
      }
    }
  }

  return resultsForView;
}

export function timeNeededToOvertake(result, format, overtakeAverage, overtakeBest) {
  var attemptResults = result.attempts.map((attempt) => attempt.result);
  if (attemptResults.length === 2 && format.numberOfAttempts === 5) {
    // Projection will change from a mean to a median after a time is added
    if (result.best < overtakeAverage) {
      return overtakeAverage - 1;
    }
    else {
      return NA_VALUE;
    }
  }

  if (!isComplete(result.projectedAverage)) {
    // DNF averages cannot overtake
    return NA_VALUE;
  }

  const isMean = format.numberOfAttempts === 3 || result.attempts.length < 2;
  const nextCountingSolves = result.attempts.length + (isMean ? 1 : -1);
  const totalNeeded = overtakeAverage * nextCountingSolves;
  const roundingBuffer = nextCountingSolves === 3 ? 1 : 0;
  var countingSum = sum(attemptResults);
  if (!isMean) {
    countingSum = countingSum - Math.min(...attemptResults) - Math.max(...attemptResults);
  }

  var needed = totalNeeded - countingSum + roundingBuffer;

  const newBest = Math.min(needed, result.best);
  // If best is not better, adjust needed to overtake
  if (newBest >= overtakeBest) {
    // Win by decreasing average by .01 or by overtaking on single
    needed = Math.max(needed - nextCountingSolves, overtakeBest - 1);
  }

  var bestPossibleSolve = isMean ? 1 : result.best;
  var worstPossibleSolve = isMean ? Infinity : Math.max(...attemptResults);
  if (needed < bestPossibleSolve) {
    return NA_VALUE;
  }
  if (needed >= worstPossibleSolve) {
    return DNF_VALUE;
  }
  return needed;
}

function resultProjectedAverage(result, format) {
  if (!isSkipped(result.average)) {
    return result.average;
  }

  const attemptResults = result.attempts.map((attempt) => attempt.result);
  return projectedAverage(attemptResults, format);
}
