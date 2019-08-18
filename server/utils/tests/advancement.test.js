const { Result, Competition, Event, Round } = require('./wcif-builders');
const {
  advancingResultsFromCondition,
  advancingResults,
  nextAdvancableToRound,
} = require('../advancement');

describe('advancingResultsFromCondition', () => {
  describe('ranking', () => {
    test('returns results with ranking better or equal to the given one', () => {
      const results = [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
        Result({ ranking: 5, personId: 5 })
      ];
      const advancementCondition = { type: 'ranking', level: 3 };
      expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 3));
    });
  });

  describe('percent', () => {
    test('rounds the number of advancing people down', () => {
      const results = [
        Result({ ranking: 1, personId: 1, best: 1000 }),
        Result({ ranking: 2, personId: 2, best: 1100 }),
        Result({ ranking: 3, personId: 3, best: 1200 }),
        Result({ ranking: 4, personId: 4, best: 1300 }),
        Result({ ranking: 5, personId: 5, best: 1400 })
      ];
      const advancementCondition = { type: 'percent', level: 50 };
      expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 2));
    });
  });

  describe('attemptResult', () => {
    test('returns results with an attempt *better than* the specified one', () => {
      const results = [
        Result({ ranking: 1, personId: 1, best: 1000 }),
        Result({ ranking: 2, personId: 2, best: 1100 }),
        Result({ ranking: 3, personId: 3, best: 1200 }),
        Result({ ranking: 4, personId: 4, best: 1300 }),
        Result({ ranking: 5, personId: 5, best: 1400 })
      ];
      const advancementCondition = { type: 'attemptResult', level: 1200 };
      expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 2));
    });
  });

  test('if people with the same ranking don\'t fit in 75%, neither is advanced', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 3, personId: 4 }),
      Result({ ranking: 5, personId: 5 })
    ];
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 2));
  });

  test('does not return more than 75% even if satisfy advancement condition', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 4, personId: 4 }),
      Result({ ranking: 5, personId: 5 })
    ];
    const advancementCondition = { type: 'ranking', level: 4 };
    expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 3));
  });

  test('does not advance incomplete results', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2, attempts: [-1, 0, 0], best: -1, average: -1 }),
      Result({ ranking: null, personId: 3 }),
      Result({ ranking: null, personId: 4 }),
      Result({ ranking: null, personId: 5 })
    ];
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(advancingResultsFromCondition(results, advancementCondition)).toEqual(results.slice(0, 1));
  });

  test('does not treat DNF results as satisfying attemptResult advancement condition', () => {
    const results = [
      Result({ ranking: 1, personId: 1, attempts: [{ result: 2000 }, { result: 3000 }], best: 2000 }),
      Result({ ranking: 2, personId: 2, attempts: [{ result: -1 }, { result: -1 }], best: -1 }),
    ];
    const advancementCondition = { type: 'attemptResult', level: 1500 };
    expect(advancingResultsFromCondition(results, advancementCondition)).toEqual([]);
  });
});

describe('advancingResults', () => {
  describe('if the next round has results', () => {
    test('returns results corresponding to the people who actually advanced', () => {
      const round1 = Round({ id: '333-r1', results: [1, 2, 3, 4].map(personId => Result({ personId })) });
      const round2 = Round({ id: '333-r2', results: [2, 4].map(personId => Result({ personId })) });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(advancingResults(round1, wcif)).toEqual([
        round1.results[1], round1.results[3]
      ]);
    });
  });

  describe('if the next round has no results', () => {
    test('returns people satisfying the given advancement condition', () => {
      const round1 = Round({
        id: '333-r1',
        results: [
          Result({ ranking: 1, personId: 1 }),
          Result({ ranking: 2, personId: 2 }),
          Result({ ranking: 3, personId: 3 }),
          Result({ ranking: 4, personId: 4 }),
        ],
        advancementCondition: { type: 'ranking', level: 2 },
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(advancingResults(round1, wcif)).toEqual(round1.results.slice(0, 2));
    });
  });
});

describe('nextAdvancableToRound', () => {
  test('returns an empty array if a first round is given', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
    });
    expect(nextAdvancableToRound(wcif, '333-r1')).toEqual([]);
  });

  test('returns id of the next person who could advance to the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 2 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextAdvancableToRound(wcif, '333-r2')).toEqual([3]);
  });

  test('returns multiple person ids if all could advance', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 3, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 2 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextAdvancableToRound(wcif, '333-r2')).toEqual([3, 4]);
  });

  test('returns an empty array if there are too many people to fit in advanced 75%', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
        Result({ ranking: 4, personId: 5 }),
      ],
      advancementCondition: { type: 'ranking', level: 3 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ personId: 1 }), Result({ personId: 2 }), Result({ personId: 3 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextAdvancableToRound(wcif, '333-r2')).toEqual([]);
  });

  test('ignores people who already quit the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 2 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ personId: 1 }), Result({ personId: 3 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextAdvancableToRound(wcif, '333-r2')).toEqual([4]);
  });
});
