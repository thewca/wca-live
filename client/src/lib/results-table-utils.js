export const statsToDisplay = (format, eventId) => {
  const { numberOfAttempts, sortBy } = format;
  const computeAverage =
    [3, 5].includes(numberOfAttempts) && eventId !== '333mbf';
  if (!computeAverage)
    return [{ name: 'Best', type: 'best', recordTagField: 'singleRecordTag' }];
  const stats = [
    { name: 'Best', type: 'best', recordTagField: 'singleRecordTag' },
    {
      name: numberOfAttempts === 3 ? 'Mean' : 'Average',
      type: 'average', // TODO: type -> field (?)
      recordTagField: 'averageRecordTag',
    },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
};
