import { times } from "./utils";
import { shouldComputeAverage } from "./result";

export const SKIPPED_VALUE = 0;
export const DNF_VALUE = -1;
export const DNS_VALUE = -2;

function isComplete(attemptResult) {
  return attemptResult > 0;
}

function isSkipped(attemptResult) {
  return attemptResult === SKIPPED_VALUE;
}

function compareAttemptResults(attemptResult1, attemptResult2) {
  if (!isComplete(attemptResult1) && !isComplete(attemptResult2)) return 0;
  if (!isComplete(attemptResult1) && isComplete(attemptResult2)) return 1;
  if (isComplete(attemptResult1) && !isComplete(attemptResult2)) return -1;
  return attemptResult1 - attemptResult2;
}

/**
 * Returns the specified number of attempt results filling missing ones with 0.
 */
export function padSkipped(attemptResults, numberOfAttempts) {
  return times(numberOfAttempts, (index) =>
    index < attemptResults.length ? attemptResults[index] : SKIPPED_VALUE
  );
}

/**
 * Removes trailing skipped attempt results from the given list.
 */
export function trimTrailingSkipped(attemptResults) {
  if (attemptResults.length === 0) return [];
  if (attemptResults[attemptResults.length - 1] === SKIPPED_VALUE) {
    return trimTrailingSkipped(attemptResults.slice(0, -1));
  }
  return attemptResults;
}

/**
 * Returns the best attempt result from the given list.
 *
 * @example
 * best([900, -1, 700]); // => 700
 */
export function best(attemptResults) {
  const nonSkipped = attemptResults.filter((attempt) => !isSkipped(attempt));
  const completeAttempts = attemptResults.filter(isComplete);

  if (nonSkipped.length === 0) return SKIPPED_VALUE;
  if (completeAttempts.length === 0) return Math.max(...nonSkipped);
  return Math.min(...completeAttempts);
}

/**
 * Returns the average of the given attempt results.
 *
 * Calculates either Mean of 3 or Average of 5 depending on
 * the number of the given attempt results.
 *
 * @example
 * average([900, -1, 700, 800, 900], '333'); // => 800
 * average([900, -1, 700, 800, -1], '333'); // => -1
 */
export function average(attemptResults, eventId) {
  if (!eventId) {
    /* If eventId is omitted, the average is still calculated correctly except for FMC
       and that may be a hard to spot bug, so better enforce explicity here. */
    throw new Error("Missing argument: eventId");
  }

  if (eventId === "333mbf") return SKIPPED_VALUE;

  if (attemptResults.some(isSkipped)) return SKIPPED_VALUE;

  if (eventId === "333fm") {
    const scaled = attemptResults.map((attemptResult) => attemptResult * 100);
    switch (attemptResults.length) {
      case 3:
        return meanOf3(scaled);
      case 5:
        return averageOf5(scaled);
      default:
        throw new Error(
          `Invalid number of attempt results, expected 3 or 5, got ${attemptResults.length}.`
        );
    }
  }

  switch (attemptResults.length) {
    case 3:
      return roundOver10Mins(meanOf3(attemptResults));
    case 5:
      return roundOver10Mins(averageOf5(attemptResults));
    default:
      throw new Error(
        `Invalid number of attempt results, expected 3 or 5, got ${attemptResults.length}.`
      );
  }
}

/* See: https://www.worldcubeassociation.org/regulations/#9f2 */
function roundOver10Mins(value) {
  if (!isComplete(value)) return value;
  if (value <= 10 * 6000) return value;
  return Math.round(value / 100) * 100;
}

function averageOf5(attemptResults) {
  const [, x, y, z] = attemptResults.slice().sort(compareAttemptResults);
  return meanOf3([x, y, z]);
}

function meanOf3(attemptResults) {
  if (!attemptResults.every(isComplete)) return DNF_VALUE;
  return mean(attemptResults);
}

function mean(values) {
  const sum = values.reduce((x, y) => x + y, 0);
  return Math.round(sum / values.length);
}

/**
 * Calculates the best possible average of 5 for the given attempts.
 *
 * Expects exactly 4 attempt results to be given.
 *
 * @example
 * bestPossibleAverage([3642, 3102, 3001, 2992]); // => 3032
 * bestPossibleAverage([6111, -1, -1, 6000]); // => -1
 * bestPossibleAverage([4822, 4523, 4233, -1]; // => 4526
 */
export function bestPossibleAverage(attemptResults) {
  if (attemptResults.length !== 4) {
    throw new Error(
      `Invalid number of attempt results, expected 4, got ${attemptResults.length}.`
    );
  }

  const [x, y, z] = attemptResults.slice().sort(compareAttemptResults);
  const mean = meanOf3([x, y, z]);
  return roundOver10Mins(mean);
}

/**
 * Calculates the worst possible average of 5 for the given attempts.
 *
 * Expects exactly 4 attempt results to be given.
 *
 * @example
 * worstPossibleAverage([3642, 3102, 3001, 2992]); // => 3248
 * worstPossibleAverage([6111, -1, -1, 6000]); // => -1
 * worstPossibleAverage([6111, -1, 6000, 5999]); // => -1
 */
export function worstPossibleAverage(attemptResults) {
  if (attemptResults.length !== 4) {
    throw new Error(
      `Invalid number of attempt results, expected 4, got ${attemptResults.length}.`
    );
  }

  const [, x, y, z] = attemptResults.slice().sort(compareAttemptResults);
  const mean = meanOf3([x, y, z]);
  return roundOver10Mins(mean);
}

/**
 * Calculates mean of 2 for the given attempt results.
 */
export function incompleteMean(attemptResults, eventId) {
  if (attemptResults.length !== 2) {
    throw new Error(
      `Invalid number of attempt results, expected 2, got ${attemptResults.length}.`
    );
  }

  if (!attemptResults.every(isComplete)) return DNF_VALUE;

  if (eventId === "333fm") {
    const scaled = attemptResults.map((attemptResult) => attemptResult * 100);
    return mean(scaled);
  }

  return roundOver10Mins(mean(attemptResults));
}

/**
 * Returns an object representation of the given MBLD attempt result.
 *
 * @example
 * decodeMbldAttemptResult(900348002); // => { solved: 11, attempted: 13, centiseconds: 348000 }
 */
export function decodeMbldAttemptResult(value) {
  if (value <= 0) return { solved: 0, attempted: 0, centiseconds: value };
  const missed = value % 100;
  const seconds = Math.floor(value / 100) % 1e5;
  const points = 99 - (Math.floor(value / 1e7) % 100);
  const solved = points + missed;
  const attempted = solved + missed;
  const centiseconds = seconds === 99999 ? null : seconds * 100;
  return { solved, attempted, centiseconds };
}

/**
 * Returns a MBLD attempt result based on the given object representation.
 *
 * @example
 * encodeMbldAttemptResult({ solved: 11, attempted: 13, centiseconds: 348000 }); // => 900348002
 */
export function encodeMbldAttemptResult({ solved, attempted, centiseconds }) {
  if (centiseconds <= 0) return centiseconds;
  const missed = attempted - solved;
  const points = solved - missed;
  const seconds = Math.round(
    (centiseconds || 9999900) / 100
  ); /* 99999 seconds is used for unknown time. */
  return (99 - points) * 1e7 + seconds * 1e2 + missed;
}

/**
 * Returns the number of points for the given MBLD attempt result.
 */
export function mbldAttemptResultToPoints(attemptResult) {
  const { solved, attempted } = decodeMbldAttemptResult(attemptResult);
  const missed = attempted - solved;
  return solved - missed;
}

/**
 * Converts centiseconds to a human-friendly string.
 */
export function centisecondsToClockFormat(centiseconds) {
  if (!Number.isFinite(centiseconds)) {
    throw new Error(
      `Invalid centiseconds, expected positive number, got ${centiseconds}.`
    );
  }
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, "");
}

/**
 * Converts the given attempt result to a human-friendly string.
 *
 * @example
 * formatAttemptResult(-1, '333'); // => 'DNF'
 * formatAttemptResult(6111, '333'); // => '1:01.11'
 * formatAttemptResult(900348002, '333mbf'); // => '11/13 58:00'
 */
export function formatAttemptResult(attemptResult, eventId) {
  if (attemptResult === SKIPPED_VALUE) return "";
  if (attemptResult === DNF_VALUE) return "DNF";
  if (attemptResult === DNS_VALUE) return "DNS";
  if (eventId === "333mbf") return formatMbldAttemptResult(attemptResult);
  if (eventId === "333fm") return formatFmAttemptResult(attemptResult);
  return centisecondsToClockFormat(attemptResult);
}

function formatMbldAttemptResult(attemptResult) {
  const { solved, attempted, centiseconds } =
    decodeMbldAttemptResult(attemptResult);
  const clockFormat = centisecondsToClockFormat(centiseconds);
  const shortClockFormat = clockFormat.replace(/\.00$/, "");
  return `${solved}/${attempted} ${shortClockFormat}`;
}

function formatFmAttemptResult(attemptResult) {
  /* Note: FM singles are stored as the number of moves (e.g. 25),
     while averages are stored with 2 decimal places (e.g. 2533 for an average of 25.33 moves). */
  const isAverage = attemptResult >= 1000;
  return isAverage
    ? (attemptResult / 100).toFixed(2)
    : attemptResult.toString();
}

/**
 * Alters the given MBLD decoded value, so that it conforms to the WCA regulations.
 */
export function autocompleteMbldDecodedValue({
  attempted,
  solved,
  centiseconds,
}) {
  // We expect the values to be entered left-to-right, so we reset to
  // defaults otherwise
  if ((!solved && attempted) || (!solved && !attempted && centiseconds > 0)) {
    return { solved: 0, attempted: 0, centiseconds: 0 };
  }

  if (!attempted || solved > attempted) {
    return { solved, attempted: solved, centiseconds };
  }
  // See https://www.worldcubeassociation.org/regulations/#9f12c
  if (solved < attempted / 2 || solved <= 1) {
    return { solved: 0, attempted: 0, centiseconds: DNF_VALUE };
  }
  // See https://www.worldcubeassociation.org/regulations/#H1b
  // But allow additional two +2s per cube over the limit, just in case.
  if (
    centiseconds >
    10 * 60 * 100 * Math.min(6, attempted) + attempted * 2 * 2 * 100
  ) {
    return { solved: 0, attempted: 0, centiseconds: DNF_VALUE };
  }
  return { solved, attempted, centiseconds };
}

/**
 * Alters the given FM attempt result, so that it conforms to the WCA regulations.
 */
export function autocompleteFmAttemptResult(moves) {
  // See https://www.worldcubeassociation.org/regulations/#E2d1
  if (moves > 80) return DNF_VALUE;
  return moves;
}

/**
 * Alters the given time attempt result, so that it conforms to the WCA regulations.
 */
export function autocompleteTimeAttemptResult(time) {
  // See https://www.worldcubeassociation.org/regulations/#9f2
  return roundOver10Mins(time);
}

/**
 * Checks whether a given attempt is a world record of the given type.
 * Returns the corresponding boolean.
 */
export function isWorldRecord(
  attemptResult,
  eventId,
  type,
  officialWorldRecords = []
) {
  const wr =
    officialWorldRecords.find(
      (wr) => wr.type === type && wr.event.id === eventId
    ) || null;

  return (
    wr !== null &&
    isComplete(attemptResult) &&
    attemptResult <= wr.attemptResult
  );
}

/**
 * Checks the given attempt results for discrepancies and returns
 * a warning message if some are found.
 */
export function attemptResultsWarning(
  attemptResults,
  eventId,
  officialWorldRecords = []
) {
  const skippedGapIndex =
    trimTrailingSkipped(attemptResults).indexOf(SKIPPED_VALUE);
  if (skippedGapIndex !== -1) {
    return `You've omitted attempt ${
      skippedGapIndex + 1
    }. Make sure it's intentional.`;
  }
  const completeAttempts = attemptResults.filter(isComplete);
  if (completeAttempts.length > 0) {
    const bestSingle = Math.min(...completeAttempts);
    const newWorldRecordSingle = isWorldRecord(
      bestSingle,
      eventId,
      "single",
      officialWorldRecords
    );
    if (newWorldRecordSingle) {
      return `
          The result you're trying to submit includes a new world record single
          (${formatAttemptResult(bestSingle, eventId)}).
          Please check that the results are accurate.
        `;
    }

    if (shouldComputeAverage(eventId, attemptResults.length)) {
      const newWorldRecordAverage = isWorldRecord(
        average(attemptResults, eventId),
        eventId,
        "average",
        officialWorldRecords
      );

      if (newWorldRecordAverage) {
        return `
          The result you're trying to submit is a new world record average
          (${formatAttemptResult(average(attemptResults, eventId), eventId)}).
          Please check that the results are accurate.
        `;
      }
    }

    if (eventId === "333mbf") {
      const lowTimeIndex = attemptResults.findIndex((attempt) => {
        const { attempted, centiseconds } = decodeMbldAttemptResult(attempt);
        return attempt > 0 && centiseconds / attempted < 30 * 100;
      });
      if (lowTimeIndex !== -1) {
        return `
        The result you're trying to submit seems to be impossible:
        attempt ${lowTimeIndex + 1} is done in
        less than 30 seconds per cube tried.
        If you want to enter minutes, don't forget to add two zeros
        for centiseconds at the end of the score.
      `;
      }
    } else {
      const worstSingle = Math.max(...completeAttempts);
      const inconsistent = worstSingle > bestSingle * 4;
      if (inconsistent) {
        return `
          The result you're trying to submit seem to be inconsistent.
          There's a big difference between the best single
          (${formatAttemptResult(bestSingle, eventId)}) and the worst single
          (${formatAttemptResult(worstSingle, eventId)}).
          Please check that the results are accurate.
        `;
      }
    }
  }
  return null;
}

/**
 * Alters the given attempt results, so that they conform to the given time limit.
 */
export function applyTimeLimit(attemptResults, timeLimit) {
  if (timeLimit === null) return attemptResults;
  if (timeLimit.cumulativeRoundWcifIds.length === 0) {
    return attemptResults.map((attemptResult) =>
      attemptResult >= timeLimit.centiseconds ? DNF_VALUE : attemptResult
    );
  } else {
    // Note: for now cross-round cumulative time limits are handled
    // as single-round cumulative time limits for each of the rounds.
    const [updatedAttemptResults] = attemptResults.reduce(
      ([updatedAttemptResults, sum], attemptResult) => {
        const updatedSum = attemptResult > 0 ? sum + attemptResult : sum;
        const updatedAttemptResult =
          attemptResult > 0 && updatedSum >= timeLimit.centiseconds
            ? DNF_VALUE
            : attemptResult;
        return [updatedAttemptResults.concat(updatedAttemptResult), updatedSum];
      },
      [[], 0]
    );
    return updatedAttemptResults;
  }
}

/**
 * Alters the given attempt results, so that they conform to the given cutoff.
 */
export function applyCutoff(attemptResults, cutoff) {
  if (meetsCutoff(attemptResults, cutoff)) {
    return attemptResults;
  }

  return attemptResults.map((attemptResult, index) =>
    index < cutoff.numberOfAttempts ? attemptResult : SKIPPED_VALUE
  );
}

/**
 * Checks if the given attempt results meet the given cutoff.
 */
export function meetsCutoff(attemptResults, cutoff) {
  if (!cutoff) return true;
  const { numberOfAttempts, attemptResult } = cutoff;
  return attemptResults
    .slice(0, numberOfAttempts)
    .some((attempt) => attempt > 0 && attempt < attemptResult);
}
