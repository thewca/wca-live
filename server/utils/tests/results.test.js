const { Result } = require('./wcif-builders');
const { updateRanking } = require('../results');

describe('updateRanking', () => {
  describe('when sorting by average', () => {
    test('orders by average in the first place', () => {
      const result1 = Result({ personId: 1, best: 1000, average: -1 });
      const result2 = Result({ personId: 2, best: 1000, average: 1090 });
      const result3 = Result({ personId: 3, best: 950, average: 980 });
      const results = [result1, result2, result3];
      expect(updateRanking(results, 'a')).toEqual([
        { ...result3, ranking: 1 },
        { ...result2, ranking: 2 },
        { ...result1, ranking: 3 },
      ]);
    });

    test('orders by best results with the same average', () => {
      const result1 = Result({ personId: 1, best: 950, average: 980 });
      const result2 = Result({ personId: 2, best: 900, average: 980 });
      const results = [result1, result2];
      expect(updateRanking(results, 'a')).toEqual([
        { ...result2, ranking: 1 },
        { ...result1, ranking: 2 },
      ]);
    });

    test('assigns the same ranking to results with the same best and average', () => {
      const result1 = Result({ personId: 1, best: 700, average: 800 });
      const result2 = Result({ personId: 2, best: 1000, average: 900 });
      const result3 = Result({ personId: 3, best: 700, average: 800 });
      const results = [result1, result2, result3];
      expect(updateRanking(results, '3')).toEqual([
        { ...result1, ranking: 1 },
        { ...result3, ranking: 1 },
        { ...result2, ranking: 3 },
      ]);
    });
  });

  describe('when sorting by best', () => {
    test('orders by best in the first place', () => {
      const result1 = Result({ personId: 1, best: 700, average: 800 });
      const result2 = Result({ personId: 2, best: 1000, average: -1 });
      const result3 = Result({ personId: 3, best: 950, average: 0 });
      const results = [result1, result2, result3];
      expect(updateRanking(results, '3')).toEqual([
        { ...result1, ranking: 1 },
        { ...result3, ranking: 2 },
        { ...result2, ranking: 3 },
      ]);
    });

    test('assigns the same ranking to results with the same best', () => {
      const result1 = Result({ personId: 1, best: 700, average: 800 });
      const result2 = Result({ personId: 2, best: 1000, average: 700 });
      const result3 = Result({ personId: 3, best: 700, average: -1 });
      const results = [result1, result2, result3];
      expect(updateRanking(results, '3')).toEqual([
        { ...result1, ranking: 1 },
        { ...result3, ranking: 1 },
        { ...result2, ranking: 3 },
      ]);
    });
  });

  test('assigns null ranking to empty results', () => {
    const result1 = Result({ personId: 1, best: 0, average: 0, attempts: [] });
    const result2 = Result({ personId: 2, best: 900, average: 980 });
    const results = [result1, result2];
    expect(updateRanking(results, 'a')).toEqual([
      { ...result2, ranking: 1 },
      { ...result1, ranking: null },
    ]);
  });

  test('handles multiple ties correctly', () => {
    const result1 = Result({ personId: 1, best: 700, average: 800 });
    const result2 = Result({ personId: 2, best: 1000, average: 900 });
    const result3 = Result({ personId: 3, best: 700, average: 800 });
    const result4 = Result({ personId: 3, best: 700, average: 800 });
    const results = [result1, result2, result3, result4];
    expect(updateRanking(results, 'a')).toEqual([
      { ...result1, ranking: 1 },
      { ...result3, ranking: 1 },
      { ...result4, ranking: 1 },
      { ...result2, ranking: 4 },
    ]);
  });
});
