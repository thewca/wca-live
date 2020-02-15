const {
  Result,
  Competition,
  Event,
  Round,
  Person,
} = require('./wcif-builders');
const {
  qualifyingResults,
  advancingResults,
  personIdsForRound,
  nextQualifyingToRound,
  missingQualifyingIds,
} = require('../advancement');

describe('qualifyingResults', () => {
  test('returns an empty array if no results are given', () => {
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(qualifyingResults([], advancementCondition, 'a')).toEqual([]);
  });

  describe('ranking', () => {
    test('returns results with ranking better or equal to the given one', () => {
      const results = [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
        Result({ ranking: 5, personId: 5 }),
      ];
      const advancementCondition = { type: 'ranking', level: 3 };
      expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
        results.slice(0, 3)
      );
    });
  });

  describe('percent', () => {
    test('rounds the number of advancing people down', () => {
      const results = [
        Result({ ranking: 1, personId: 1, best: 1000 }),
        Result({ ranking: 2, personId: 2, best: 1100 }),
        Result({ ranking: 3, personId: 3, best: 1200 }),
        Result({ ranking: 4, personId: 4, best: 1300 }),
        Result({ ranking: 5, personId: 5, best: 1400 }),
      ];
      const advancementCondition = { type: 'percent', level: 50 };
      expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
        results.slice(0, 2)
      );
    });
  });

  describe('attemptResult', () => {
    describe('when the format sorts by best', () => {
      test('returns results with best *better than* the specified value', () => {
        const results = [
          Result({ ranking: 1, personId: 1, best: 1000 }),
          Result({ ranking: 2, personId: 2, best: 1100 }),
          Result({ ranking: 3, personId: 3, best: 1200 }),
          Result({ ranking: 4, personId: 4, best: 1300 }),
          Result({ ranking: 5, personId: 5, best: 1400 }),
        ];
        const advancementCondition = { type: 'attemptResult', level: 1200 };
        expect(qualifyingResults(results, advancementCondition, '3')).toEqual(
          results.slice(0, 2)
        );
      });
    });

    describe('when the format sorts by average', () => {
      test('returns results with average *better than* the specified value', () => {
        const results = [
          Result({ ranking: 1, personId: 1, average: 1000 }),
          Result({ ranking: 2, personId: 2, average: 1100 }),
          Result({ ranking: 3, personId: 3, average: 1200 }),
          Result({ ranking: 4, personId: 4, average: 1300 }),
          Result({ ranking: 5, personId: 5, average: 1400 }),
        ];
        const advancementCondition = { type: 'attemptResult', level: 1200 };
        expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
          results.slice(0, 2)
        );
      });
    });
  });

  test("if people with the same ranking don't fit in 75%, neither qualify", () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 3, personId: 4 }),
      Result({ ranking: 5, personId: 5 }),
    ];
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
      results.slice(0, 2)
    );
  });

  test('does not return more than 75% even if satisfy advancement condition', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 4, personId: 4 }),
      Result({ ranking: 5, personId: 5 }),
    ];
    const advancementCondition = { type: 'ranking', level: 4 };
    expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
      results.slice(0, 3)
    );
  });

  test('does not qualify incomplete results', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({
        ranking: 2,
        personId: 2,
        attempts: [-1, 0, 0],
        best: -1,
        average: -1,
      }),
      Result({ ranking: null, personId: 3 }),
      Result({ ranking: null, personId: 4 }),
      Result({ ranking: null, personId: 5 }),
    ];
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(qualifyingResults(results, advancementCondition, 'a')).toEqual(
      results.slice(0, 1)
    );
  });

  test('does not treat DNF results as satisfying attemptResult advancement condition', () => {
    const results = [
      Result({
        ranking: 1,
        personId: 1,
        attempts: [{ result: 2000 }, { result: 3000 }],
        best: 2000,
      }),
      Result({
        ranking: 2,
        personId: 2,
        attempts: [{ result: -1 }, { result: -1 }],
        best: -1,
      }),
    ];
    const advancementCondition = { type: 'attemptResult', level: 1500 };
    expect(qualifyingResults(results, advancementCondition, '2')).toEqual([]);
  });

  describe('when no advancement condition is given', () => {
    test('returns results with top 3 ranking', () => {
      const results = [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
        Result({ ranking: 5, personId: 5 }),
      ];
      expect(qualifyingResults(results, null, 'a')).toEqual(results.slice(0, 3));
    });

    test('returns more than 3 people if there are ties', () => {
      const results = [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 3, personId: 4 }),
        Result({ ranking: 5, personId: 5 }),
      ];
      expect(qualifyingResults(results, null, 'a')).toEqual(results.slice(0, 4));
    });

    test('does not return people without any successful attempt', () => {
      const results = [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3, best: -1 }),
      ];
      expect(qualifyingResults(results, null, 'a')).toEqual(results.slice(0, 2));
    });
  });

  test('throws an error when invalid advancement condition type is given', () => {
    const results = [
      Result({ personId: 1, ranking: 1 }),
      Result({ personId: 2, ranking: 2 }),
    ];
    const advancementCondition = { type: 'cat', level: 100 };
    expect(() => {
      qualifyingResults(results, advancementCondition, 'a');
    }).toThrow(new Error(`Unrecognised AdvancementCondition type: 'cat'`));
  });
});

describe('advancingResults', () => {
  describe('if the next round has results', () => {
    test('returns results corresponding to the people who actually advanced', () => {
      const round1 = Round({
        id: '333-r1',
        results: [1, 2, 3, 4].map(personId => Result({ personId })),
      });
      const round2 = Round({
        id: '333-r2',
        results: [2, 4].map(personId => Result({ personId })),
      });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(advancingResults(round1, wcif)).toEqual([
        round1.results[1],
        round1.results[3],
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
      expect(advancingResults(round1, wcif)).toEqual(
        round1.results.slice(0, 2)
      );
    });
  });
});

describe('personIdsForRound', () => {
  describe('when a first round is given', () => {
    const person1 = Person({
      registrantId: 1,
      registration: { eventIds: ['333', '222'] },
    });
    const person2 = Person({
      registrantId: 2,
      registration: { eventIds: ['333'] },
    });
    const personNotRegistered = Person({
      registrantId: 3,
      registration: { eventIds: ['222'] },
    });
    const personNotAccepted = Person({
      registrantId: 4,
      registration: { eventIds: ['333'], status: 'pending' },
    });

    test('returns id of people who registered for that event', () => {
      const wcif = Competition({
        persons: [person1, person2, personNotRegistered],
      });
      expect(personIdsForRound(wcif, '333-r1')).toEqual([1, 2]);
    });

    test('returns only ids of people with accepted registration', () => {
      const wcif = Competition({ persons: [person1, personNotAccepted] });
      expect(personIdsForRound(wcif, '333-r1')).toEqual([1]);
    });
  });

  describe('when a further round is given', () => {
    test('returns ids of people who qualify to the given round', () => {
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
      expect(personIdsForRound(wcif, '333-r2')).toEqual([1, 2]);
    });
  });
});

describe('nextQualifyingToRound', () => {
  test('returns an empty array if a first round is given', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
    });
    expect(nextQualifyingToRound(wcif, '333-r1')).toEqual([]);
  });

  test('returns an empty array if no one satisfies the advancement criteria', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, best: -1, attempts: [-1] }),
        Result({ ranking: 1, personId: 2, best: -1, attempts: [-1] }),
      ],
      advancementCondition: { type: 'ranking', level: 1 },
    });
    const round2 = Round({ id: '333-r2', results: [] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextQualifyingToRound(wcif, '333-r2')).toEqual([]);
  });

  test('returns id of the next person who could qualify to the given round', () => {
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
    expect(nextQualifyingToRound(wcif, '333-r2')).toEqual([3]);
  });

  test('returns multiple person ids if all could qualify', () => {
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
    expect(nextQualifyingToRound(wcif, '333-r2')).toEqual([3, 4]);
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
      results: [
        Result({ personId: 1 }),
        Result({ personId: 2 }),
        Result({ personId: 3 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(nextQualifyingToRound(wcif, '333-r2')).toEqual([]);
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
    expect(nextQualifyingToRound(wcif, '333-r2')).toEqual([4]);
  });
});

describe('missingQualifyingIds', () => {
  describe('when a first round is given', () => {
    test('qualifies any accepted competitor who is not in the given round', () => {
      const round1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 })],
      });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({
            registrantId: 2,
            registration: { eventIds: ['333'], status: 'accepted' },
          }),
          Person({
            registrantId: 3,
            registration: { eventIds: ['333'], status: 'pending' },
          }),
          Person({
            registrantId: 4,
            registration: { eventIds: ['222'], status: 'accepted' },
          }),
        ],
      });
      const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, '333-r1');
      expect(qualifyingIds).toEqual([2, 4]);
      expect(excessIds).toEqual([]);
    });
  });

  test('returns empty arrays if no one else qualifies', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 3 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [
        Result({ personId: 1 }),
        Result({ personId: 2 }),
        Result({ personId: 3 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, '333-r2');
    expect(qualifyingIds).toEqual([]);
    expect(excessIds).toEqual([]);
  });

  test('returns only qualifying people if there is a free spot', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 3 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ personId: 1 }), Result({ personId: 3 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, '333-r2');
    expect(qualifyingIds).toEqual([2, 4]);
    expect(excessIds).toEqual([]);
  });

  test('returns excess people if someone qualifies, but there is no free spot', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 4, personId: 4 }),
      ],
      advancementCondition: { type: 'ranking', level: 3 },
    });
    const round2 = Round({
      id: '333-r2',
      results: [
        Result({ personId: 1 }),
        Result({ personId: 3 }),
        Result({ personId: 4 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, '333-r2');
    expect(qualifyingIds).toEqual([2]);
    expect(excessIds).toEqual([4]);
  });

  test('does not treat tied competitors as qualifying if there is a spot for just one', () => {
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
      results: [Result({ personId: 1 }), Result({ personId: 3 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, '333-r2');
    expect(qualifyingIds).toEqual([2]);
    expect(excessIds).toEqual([]);
  });
});
