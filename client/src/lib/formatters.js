import {
  mbldAttemptResultToPoints,
  centisecondsToClockFormat,
} from "./attempt-result";

/**
 * Converts the given cutoff to a human-friendly string.
 */
export function formatCutoff(cutoff, eventId) {
  if (!cutoff) return "None";

  if (eventId === "333mbf") {
    return `${mbldAttemptResultToPoints(cutoff.attemptResult)} points`;
  }

  if (eventId === "333fm") {
    return `${cutoff.attemptResult} moves`;
  }

  return centisecondsToClockFormat(cutoff.attemptResult);
}

/**
 * Converts the given time limit to a human-friendly string.
 */
export function formatTimeLimit(timeLimit, eventId) {
  if (["333mbf", "333fm"].includes(eventId)) return "Regulated";

  const { centiseconds, cumulativeRoundWcifIds } = timeLimit;
  const clockFormat = centisecondsToClockFormat(centiseconds);

  if (cumulativeRoundWcifIds.length === 0) {
    return clockFormat;
  }

  if (cumulativeRoundWcifIds.length === 1) {
    return `${clockFormat} in total`;
  }

  return `${clockFormat} total for ${cumulativeRoundWcifIds.join(", ")}`;
}
