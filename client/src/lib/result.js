import { orderBy } from "./utils";
import {
  compareAttemptResults,
  projectedAverage,
  padSkipped,
  toMonotonic,
  isSkipped,
  isComplete,
  SKIPPED_VALUE,
  SUCCESS_VALUE,
  NA_VALUE,
  DNF_VALUE,
} from "./attempt-result";

/**
 * Returns a list of objects corresponding to result statistics - best and average.
 * The first statistic is the one that determines the ranking.
 * This is a common logic used in all result tables/dialogs.
 */
export function orderedResultStats(eventId, format, forecastView = false) {
  const { numberOfAttempts, sortBy } = format;

  if (!shouldComputeAverage(eventId, numberOfAttempts)) {
    return [{ name: "Best", field: "best", recordTagField: "singleRecordTag" }];
  }

  let stats = [
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
    });
    stats.push({
      name: "For 3rd",
      field: "forThird",
    });
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
    round.competitionEvent.event.id != "333fm" &&
    // Currently only final rounds are supported. It is the most likely
    // use case and this way we don't need to replicate advancement
    // condition and clinching logic on the client.
    round.advancementCondition === null
  );
}

function sum(values) {
  return values.reduce((x, y) => x + y, 0);
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

  if (resultsForView.length > 1) {
    for (let i = 0; i < resultsForView.length; i++) {
      let result = resultsForView[i];
      if (result.attempts.length === 0) {
        // From this point forward all results are empty, so we are done
        break;
      }
      if (isSkipped(result.average)) {
        let firstIndex = i == 0 ? 1 : 0;
        result.forFirst = timeNeededToOvertake(
          result,
          format,
          resultsForView[firstIndex]
        );
        let thirdIndex = i < 3 ? 3 : 2;
        if (thirdIndex < resultsForView.length) {
          result.forThird = timeNeededToOvertake(
            result,
            format,
            resultsForView[thirdIndex]
          );
        }
      }
    }
  }

  return resultsForView;
}

function timeNeededToOvertake(result, format, overtakeResult) {
  if (isSkipped(overtakeResult.projectedAverage)) return DNF_VALUE;

  let attemptResults = result.attempts.map((attempt) => attempt.result);
  const resultWorst = attemptResults.slice().sort(compareAttemptResults).pop();

  if (attemptResults.length === 2 && format.numberOfAttempts === 5) {
    // Projection will change from a mean to a median after a time is added
    if (
      compareAttemptResults(resultWorst, overtakeResult.projectedAverage) < 0
    ) {
      return DNF_VALUE;
    }
    if (
      compareAttemptResults(result.best, overtakeResult.projectedAverage) < 0
    ) {
      if (isComplete(overtakeResult.projectedAverage)) {
        return overtakeResult.projectedAverage - 1;
      }
      return SUCCESS_VALUE;
    }
    return NA_VALUE;
  }

  const isMean = format.numberOfAttempts === 3 || result.attempts.length < 2;

  if (!isComplete(overtakeResult.projectedAverage)) {
    if (compareAttemptResults(result.best, overtakeResult.best) < 0) {
      return DNF_VALUE;
    }
    if (!isMean && isComplete(resultWorst)) {
      return DNF_VALUE;
    }
    return SUCCESS_VALUE;
  }

  if (!isComplete(result.projectedAverage)) {
    // DNF averages cannot overtake
    return NA_VALUE;
  }

  const nextCountingSolves = result.attempts.length + (isMean ? 1 : -1);
  const totalNeeded = overtakeResult.projectedAverage * nextCountingSolves;
  // For a mean of 3, .01 can be added to achieve the same rounded result
  const roundingBuffer = nextCountingSolves === 3 ? 1 : 0;
  let countingSum = sum(attemptResults);
  if (!isMean) {
    countingSum = countingSum - result.best - resultWorst;
  }

  let needed = totalNeeded - countingSum + roundingBuffer;

  const newBest = Math.min(needed, result.best);
  // With the current "needed" value, the averages are tied.
  // If best is not better, adjust needed to overtake
  if (newBest >= overtakeResult.best) {
    // Win by decreasing average by .01 or by overtaking on single
    needed = Math.max(needed - nextCountingSolves, overtakeResult.best - 1);
  }

  let bestPossibleSolve = isMean ? 1 : result.best;
  let worstPossibleSolve = isMean ? Infinity : resultWorst;
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
