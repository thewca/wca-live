import { mbldResultToPoints, centisecondsToClockFormat } from './results';

export const cutoffToString = (cutoff, eventId) => {
  if (!cutoff) return 'None';
  if (eventId === '333mbf') {
    return `${mbldResultToPoints(cutoff.attemptResult)} points`;
  } else if (eventId === '333fm') {
    return `${cutoff.attemptResult} moves`;
  } else {
    return centisecondsToClockFormat(cutoff.attemptResult);
  }
};

export const timeLimitToString = (timeLimit, eventId) => {
  if (['333mbf', '333fm'].includes(eventId)) return 'Regulated';
  const { centiseconds, cumulativeRoundIds } = timeLimit;
  const clockFormat = centisecondsToClockFormat(centiseconds);
  if (cumulativeRoundIds.length === 0) {
    return clockFormat;
  } else if (cumulativeRoundIds.length === 1) {
    return `${clockFormat} in total`;
  } else {
    return `${clockFormat} total for ${cumulativeRoundIds.join(', ')}`;
  }
};
