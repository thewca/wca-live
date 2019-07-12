const formats = [{
  id: '1',
  name: 'Best of 1',
  shortName: 'Bo1',
  solveCount: 1,
  cutoffFormats: [],
  sortBy: 'best',
}, {
  id: '2',
  name: 'Best of 2',
  shortName: 'Bo2',
  solveCount: 2,
  cutoffFormats: ['1'],
  sortBy: 'best',
}, {
  id: '3',
  name: 'Best of 3',
  shortName: 'Bo3',
  solveCount: 3,
  cutoffFormats: ['1', '2'],
  sortBy: 'best',
}, {
  id: 'm',
  name: 'Mean of 3',
  shortName: 'Mo3',
  solveCount: 3,
  cutoffFormats: ['1', '2'],
  sortBy: 'average',
}, {
  id: 'a',
  name: 'Average of 5',
  shortName: 'Ao5',
  solveCount: 5,
  cutoffFormats: ['1', '2', '3'],
  sortBy: 'average',
}];

const formatById = id =>
  formats.find(format => format.id === id);

module.exports = {
  formatById,
};
