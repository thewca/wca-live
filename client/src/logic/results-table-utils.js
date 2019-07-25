import { best, average } from './calculations';

export const statsToDisplay = (format, eventId) => {
  const { solveCount, sortBy } = format;
  const computeAverage = [3, 5].includes(solveCount) && eventId !== '333mbf';
  if (!computeAverage) return [{ name: 'Best', fn: best }];
  const stats = [
    { name: 'Best', fn: best, type: 'single' },
    {
      name: solveCount === 3 ? 'Mean' : 'Average',
      fn: average,
      type: 'average',
    },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
};
