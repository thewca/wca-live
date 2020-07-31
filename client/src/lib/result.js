import { padSkipped } from './attempt-result';

/**
 * Returns a list of objects corresponding to result statistics - best and average.
 * The first statistic is the one that determines the ranking.
 * This is a common logic used in all result tables/dialogs.
 */
export function orderedResultStats(eventId, format) {
  const { numberOfAttempts, sortBy } = format;

  if (!shouldComputeAverage(eventId, format)) {
    return [{ name: 'Best', field: 'best', recordTagField: 'singleRecordTag' }];
  }

  const stats = [
    { name: 'Best', field: 'best', recordTagField: 'singleRecordTag' },
    {
      name: numberOfAttempts === 3 ? 'Mean' : 'Average',
      field: 'average',
      recordTagField: 'averageRecordTag',
    },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
}

/**
 * Checks if an average should be calculated in case of the given event and format.
 */
export function shouldComputeAverage(eventId, format) {
  if (eventId === '333mbf') return false;
  return [3, 5].includes(format.numberOfAttempts);
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
