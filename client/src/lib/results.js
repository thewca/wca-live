import { padSkipped } from './attempt-result';

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

export function shouldComputeAverage(eventId, format) {
  if (eventId === '333mbf') return false;
  return [3, 5].includes(format.numberOfAttempts);
}

export function paddedAttemptResults(result, numberOfAttempts) {
  const attemptResults = result.attempts.map((attempt) => attempt.result);
  return padSkipped(attemptResults, numberOfAttempts);
}
