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

/* Adds 0 for missing attempts, so they conform to the given length. */
export function padSkipped(attemptResults, numberOfAttempts) {
  return Array.from(
    { length: numberOfAttempts },
    (_, index) => attemptResults[index] || 0
  );
}

export function trimTrailingSkipped(attemptResults) {
  if (attemptResults.length === 0) return [];
  return attemptResults[attemptResults.length - 1] === SKIPPED_VALUE
    ? trimTrailingSkipped(attemptResults.slice(0, -1))
    : attemptResults;
}

export function best(attemptResults) {
  const nonSkipped = attemptResults.filter((attempt) => !isSkipped(attempt));
  const completeAttempts = attemptResults.filter(isComplete);

  if (nonSkipped.length === 0) return SKIPPED_VALUE;
  if (completeAttempts.length === 0) return Math.max(...nonSkipped);
  return Math.min(...completeAttempts);
}

export function average(attemptResults, eventId) {
  if (!eventId) {
    /* If eventId is omitted, the average is still calculated correctly except for FMC
       and that may be a hard to spot bug, so better enforce explicity here. */
    throw new Error('Missing argument: eventId');
  }

  if (eventId === '333mbf') return SKIPPED_VALUE;

  if (attemptResults.some(isSkipped)) return SKIPPED_VALUE;

  if (eventId === '333fm') {
    const scaled = attemptResults.map((attemptResult) => attemptResult * 100);
    switch (attemptResults.length) {
      case 3:
        return meanOf3(scaled);
      case 5:
        return averageOf5(scaled);
      default:
        throw new Error(
          `Invalid number of attempt results, expected 3 or 5, given ${attemptResults.length}.`
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
        `Invalid number of attempt results, expected 3 or 5, given ${attemptResults.length}.`
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
  return mean(...attemptResults);
}

function mean(x, y, z) {
  return Math.round((x + y + z) / 3);
}

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

export function encodeMbldAttemptResult({ solved, attempted, centiseconds }) {
  if (centiseconds <= 0) return centiseconds;
  const missed = attempted - solved;
  const points = solved - missed;
  const seconds = Math.round(
    (centiseconds || 9999900) / 100
  ); /* 99999 seconds is used for unknown time. */
  return (99 - points) * 1e7 + seconds * 1e2 + missed;
}

export function mbldAttemptResultToPoints(attempt) {
  const { solved, attempted } = decodeMbldAttemptResult(attempt);
  const missed = attempted - solved;
  return solved - missed;
}

export function centisecondsToClockFormat(centiseconds) {
  if (!Number.isFinite(centiseconds)) {
    throw new Error(
      `Invalid centiseconds, expected positive number, got ${centiseconds}.`
    );
  }
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
}

export function formatAttemptResult(attemptResult, eventId) {
  if (attemptResult === SKIPPED_VALUE) return '';
  if (attemptResult === DNF_VALUE) return 'DNF';
  if (attemptResult === DNS_VALUE) return 'DNS';
  if (eventId === '333mbf') return formatMbldAttemptResult(attemptResult);
  if (eventId === '333fm') return formatFmAttemptResult(attemptResult);
  return centisecondsToClockFormat(attemptResult);
}

function formatMbldAttemptResult(attemptResult) {
  const { solved, attempted, centiseconds } = decodeMbldAttemptResult(
    attemptResult
  );
  const clockFormat = centisecondsToClockFormat(centiseconds);
  const shortClockFormat = clockFormat.replace(/\.00$/, '');
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

export function autocompleteMbldDecodedValue({
  attempted,
  solved,
  centiseconds,
}) {
  if (!attempted || solved > attempted) {
    return { solved, attempted: solved, centiseconds };
  }
  // See https://www.worldcubeassociation.org/regulations/#9f12c
  if (solved < attempted / 2 || solved <= 1) {
    return { solved: 0, attempted: 0, centiseconds: DNF_VALUE };
  }
  // See https://www.worldcubeassociation.org/regulations/#H1b
  // But allow additional (arbitrary) 30 seconds over the limit for possible +2s.
  if (centiseconds > 10 * 60 * 100 * Math.min(6, attempted) + 30 * 100) {
    return { solved: 0, attempted: 0, centiseconds: DNF_VALUE };
  }
  return { solved, attempted, centiseconds };
}

export function autocompleteFmAttemptResult(moves) {
  // See https://www.worldcubeassociation.org/regulations/#E2d1
  if (moves > 80) return DNF_VALUE;
  return moves;
}

export function autocompleteTimeAttemptResult(time) {
  // See https://www.worldcubeassociation.org/regulations/#9f2
  return roundOver10Mins(time);
}

export function attemptResultsWarning(attemptResults, eventId) {
  const skippedGapIndex = trimTrailingSkipped(attemptResults).indexOf(
    SKIPPED_VALUE
  );
  if (skippedGapIndex !== -1) {
    return `You've omitted attempt ${
      skippedGapIndex + 1
    }. Make sure it's intentional.`;
  }
  if (eventId === '333mbf') {
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
    const completeAttempts = attemptResults.filter(isComplete);
    if (completeAttempts.length > 0) {
      const bestSingle = Math.min(...completeAttempts);
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

export function applyTimeLimit(attemptResults, timeLimit) {
  if (timeLimit === null) return attemptResults;
  if (timeLimit.cumulativeRoundWcifIds.length === 0) {
    return attemptResults.map((attemptResult) =>
      attemptResult >= timeLimit.centiseconds ? DNF_VALUE : attemptResult
    );
  } else {
    /* Note: for now cross-round cumulative time limits are handled
       as single-round cumulative time limits for each of the rounds. */
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

export function applyCutoff(attemptResults, cutoff) {
  return meetsCutoff(attemptResults, cutoff)
    ? attemptResults
    : attemptResults.map((attemptResult, index) =>
        index < cutoff.numberOfAttempts ? attemptResult : SKIPPED_VALUE
      );
}

export function meetsCutoff(attemptResults, cutoff) {
  if (!cutoff) return true;
  const { numberOfAttempts, attemptResult } = cutoff;
  return attemptResults
    .slice(0, numberOfAttempts)
    .some((attempt) => attempt > 0 && attempt < attemptResult);
}
