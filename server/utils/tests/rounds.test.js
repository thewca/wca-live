const { Result, Competition, Event, Round, Person } = require('./wcif-builders');
const { openRound, clearRound } = require('../rounds');

describe('openRound', () => {
  describe('when a first round is given', () => {
    test('throws an error if no one registered for that event', () => {
      const round1 = Round({ id: '333-r1', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1] })],
        people: [],
      });
      expect(() => {
        openRound(wcif, '333-r1');
      }).toThrow(new Error('Cannot open this round as no one registered.'));
    });
  });

  describe('when a further round is given', () => {
    test('throws an error if the previous round has less than 8 competitors', () => {
      const round1 = Round({
        id: '333-r1',
        results: [
          ...[1, 2, 3, 4, 5, 6, 7].map(personId => Result({ personId })),
          Result({ ranking: null, personId: 8, attempts: [], best: 0 }), /* Empty result. */
        ],
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(() => {
        openRound(wcif, '333-r2');
      }).toThrow(new Error('Cannot open this round as the previous has less than 8 competitors.'));
    });

    test('throws an error if no one qualified', () => {
      const round1 = Round({
        id: '333-r1',
        results: [1, 2, 3, 4, 5, 6, 7, 8].map(
          personId => Result({ ranking: 1, personId, attempts: [-1], best: -1 })
        ),
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(() => {
        openRound(wcif, '333-r2');
      }).toThrow(new Error('Cannot open this round as no one qualified.'));
    });

    test('removes empty results from the previous round', () => {
      const round1 = Round({
        id: '333-r1',
        results: [
          ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => Result({ ranking: n, personId: n })),
          Result({ ranking: null, personId: 9, attempts: [], best: 0 }), /* Empty result. */
          Result({ ranking: null, personId: 10, attempts: [], best: 0 }), /* Empty result. */
        ],
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
        persons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(registrantId => Person({ registrantId })),
      });
      const updatedWcif = openRound(wcif, '333-r2');
      expect(updatedWcif.events[0].rounds[0].results).toEqual(
        wcif.events[0].rounds[0].results.slice(0, 8)
      );
    });
  });

  test('creates empty results for people advancing to the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => Result({ ranking: n, personId: n })),
      ],
      advancementCondition: { type: 'ranking', level: 5 },
    });
    const round2 = Round({ id: '333-r2', results: [] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
      persons: [1, 2, 3, 4, 5, 6, 7, 8].map(registrantId => Person({ registrantId })),
    });
    const updatedWcif = openRound(wcif, '333-r2');
    expect(updatedWcif.events[0].rounds[1].results.map(({ personId }) => personId)).toEqual(
      [1, 2, 3, 4, 5]
    );
  });

  test('throws an error if the round is already open', () => {
    const round1 = Round({
      id: '333-r1',
      results: [1, 2, 3, 4, 5, 6, 7, 8].map(personId => Result({ personId })),
    });
    const round2 = Round({ id: '333-r2', results: [Result({ personId: 1 })] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(() => {
      openRound(wcif, '333-r2');
    }).toThrow(new Error('Cannot open this round as it is already open.'));
  });
});

describe('clearRound', () => {
  test('throws an error if the next round is open', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const round2 = Round({ id: '333-r2', results: [Result({ personId: 1 })] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(() => {
      clearRound(wcif, '333-r1');
    }).toThrow(new Error('Cannot clear this round as the next round is open.'));
  });

  test('removes results from the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 }), Result({ personId: 2 })],
    });
    const round2 = Round({ id: '333-r2', results: [] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    const updatedWcif = clearRound(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results).toEqual([]);
  });
});
