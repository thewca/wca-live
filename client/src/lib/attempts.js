import { trimTrailingZeros } from './utils';
import {
  decodeMbldAttemptResult,
  formatAttemptResult,
  meetsCutoff,
} from './attempt-result';

export const validateMbldAttempt = ({ attempted, solved, centiseconds }) => {
  if (!attempted || solved > attempted) {
    return { solved, attempted: solved, centiseconds };
  }
  if (solved < attempted / 2 || solved <= 1) {
    return { solved: 0, attempted: 0, centiseconds: -1 };
  }
  /* Allow additional (arbitrary) 30 seconds over the limit for +2s. */
  if (centiseconds > 10 * 60 * 100 * Math.min(6, attempted) + 30 * 100) {
    return { solved: 0, attempted: 0, centiseconds: -1 };
  }
  return { solved, attempted, centiseconds };
};

export const attemptsWarning = (attempts, eventId) => {
  const skippedGapIndex = trimTrailingZeros(attempts).indexOf(0);
  if (skippedGapIndex !== -1) {
    return `You've omitted attempt ${
      skippedGapIndex + 1
    }. Make sure it's intentional.`;
  }
  if (eventId === '333mbf') {
    const lowTimeIndex = attempts.findIndex((attempt) => {
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
    const completeAttempts = attempts.filter((attempt) => attempt > 0);
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
};

export const applyTimeLimit = (attempts, timeLimit) => {
  if (timeLimit === null) return attempts;
  if (timeLimit.cumulativeRoundIds.length === 0) {
    return attempts.map((attempt) =>
      attempt >= timeLimit.centiseconds ? -1 : attempt
    );
  } else {
    /* Note: for now cross-round cumulative time limits are handled
       as single-round cumulative time limits for each of the rounds. */
    const [updatedAttempts] = attempts.reduce(
      ([updatedAttempts, sum], attempt) => {
        const updatedSum = attempt > 0 ? sum + attempt : sum;
        const updatedAttempt =
          attempt > 0 && updatedSum >= timeLimit.centiseconds ? -1 : attempt;
        return [updatedAttempts.concat(updatedAttempt), updatedSum];
      },
      [[], 0]
    );
    return updatedAttempts;
  }
};

export const applyCutoff = (attempts, cutoff) => {
  return meetsCutoff(attempts, cutoff)
    ? attempts
    : attempts.map((attempt, index) =>
        index < cutoff.numberOfAttempts ? attempt : 0
      );
};
