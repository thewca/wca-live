import {
  mbldAttemptResultToPoints,
  centisecondsToClockFormat,
} from './attempt-result';

export function cutoffToString(cutoff, eventId) {
  if (!cutoff) return 'None';
  if (eventId === '333mbf') {
    return `${mbldAttemptResultToPoints(cutoff.attemptResult)} points`;
  } else if (eventId === '333fm') {
    return `${cutoff.attemptResult} moves`;
  } else {
    return centisecondsToClockFormat(cutoff.attemptResult);
  }
}

export function timeLimitToString(timeLimit, eventId) {
  if (['333mbf', '333fm'].includes(eventId)) return 'Regulated';
  const { centiseconds, cumulativeRoundWcifIds } = timeLimit;
  const clockFormat = centisecondsToClockFormat(centiseconds);
  // TODO: perhaps return an enum/boolean from API
  if (cumulativeRoundWcifIds.length === 0) {
    return clockFormat;
  } else if (cumulativeRoundWcifIds.length === 1) {
    return `${clockFormat} in total`;
  } else {
    return `${clockFormat} total for ${cumulativeRoundWcifIds.join(', ')}`;
  }
}
