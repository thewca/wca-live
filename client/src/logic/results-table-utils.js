export const statsToDisplay = (format, eventId) => {
  const { solveCount, sortBy } = format;
  const computeAverage = [3, 5].includes(solveCount) && eventId !== '333mbf';
  if (!computeAverage)
    return [{ name: 'Best', type: 'best', recordType: 'single' }];
  const stats = [
    { name: 'Best', type: 'best', recordType: 'single' },
    {
      name: solveCount === 3 ? 'Mean' : 'Average',
      type: 'average',
      recordType: 'average',
    },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
};
