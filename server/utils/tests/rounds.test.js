const { Result, Competition, Event, Round, Person } = require('./wcif-builders');
const { openRound, clearRound, quitCompetitor } = require('../rounds');

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
        round1.results.slice(0, 8)
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

describe('quitCompetitor', () => {
  test('throws an error if the given competitor is not in the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
    });
    expect(() => {
      quitCompetitor(wcif, '333-r1', 2, false);
    }).toThrow(new Error('Cannot quit competitor with id 2 as he\'s not in 333-r1.'));
  });

  describe('when replace is false', () => {
    test('removes the corresponding result', () => {
      const round1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 }), Result({ personId: 2 })],
      });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1] })],
        persons: [Person({ registrantId: 1 }), Person({ registrantId: 2 })],
      });
      const updatedWcif = quitCompetitor(wcif, '333-r1', 1, false);
      expect(updatedWcif.events[0].rounds[0].results.map(({ personId }) => personId)).toEqual([2]);
    });
  });

  describe('when replace is true', () => {
    test('removes the corresponding result and adds empty results for next advancable people', () => {
      const round1 = Round({
        id: '333-r1',
        results: [
          Result({ ranking: 1, personId: 1 }),
          Result({ ranking: 2, personId: 2 }),
          Result({ ranking: 3, personId: 3 }),
          Result({ ranking: 4, personId: 4 }),
        ],
        advancementCondition: { type: 'ranking', level: 5 },
      });
      const round2 = Round({
        id: '333-r2',
        results: [
          Result({ personId: 1 }),
          Result({ personId: 2 }),
        ],
      });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
        persons: [1, 2, 3, 4].map(registrantId => Person({ registrantId })),
      });
      const updatedWcif = quitCompetitor(wcif, '333-r2', 1, true);
      expect(updatedWcif.events[0].rounds[1].results.map(({ personId }) => personId)).toEqual(
        [2, 3, 4]
      );
    });
  });
});
