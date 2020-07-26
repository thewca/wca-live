export function orderedResultStats(format, eventId) {
  const { numberOfAttempts, sortBy } = format;
  const computeAverage =
    [3, 5].includes(numberOfAttempts) && eventId !== '333mbf';

  if (!computeAverage) {
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
