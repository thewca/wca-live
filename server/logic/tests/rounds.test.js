const records = require('../records');
records.getRecordByIdCopy = jest.fn(() => ({}));

const {
  Result,
  Competition,
  Event,
  Round,
  Person,
} = require('./wcif-builders');
const {
  addCompetitor,
  clearRound,
  openRound,
  podiums,
  quitCompetitor,
  roundFinished,
  roundLabel,
} = require('../rounds');
const { times } = require('../utils');

describe('roundLabel', () => {
  test('returns null if the rund is just open', () => {
    const round = Round({
      id: '333-r1',
      results: [
        Result({
          personId: 1,
          attempts: [],
          best: 0,
          average: 0,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
      ],
    });
    expect(roundLabel(round)).toEqual(null);
  });

  test('returns highest record tag if there is any record', () => {
    const round = Round({
      id: '333-r1',
      results: [
        Result({
          personId: 1,
          updatedAt: new Date(),
          recordTags: { single: null, average: 'NR' },
        }),
        Result({
          personId: 1,
          updatedAt: new Date(),
          recordTags: { single: 'CR', average: 'PB' },
        }),
      ],
    });
    expect(roundLabel(round)).toEqual('CR');
  });

  test('returns Done if the round is finished', () => {
    const round = Round({
      id: '333-r1',
      results: [
        Result({
          personId: 1,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
        Result({
          personId: 2,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
        Result({
          personId: 3,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
      ],
    });
    expect(roundLabel(round)).toEqual('Done');
  });

  test('returns Live if the round is active but not finished', () => {
    const round = Round({
      id: '333-r1',
      results: [
        Result({
          personId: 1,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
        Result({
          personId: 2,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
        Result({
          personId: 3,
          updatedAt: new Date(),
          recordTags: { single: null, average: null },
        }),
        Result({
          personId: 3,
          updatedAt: new Date(),
          attempts: [],
          best: 0,
          average: 0,
          recordTags: { single: null, average: null },
        }),
      ],
    });
    expect(roundLabel(round)).toEqual('Live');
  });
});

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
          Result({
            ranking: null,
            personId: 8,
            attempts: [],
            best: 0,
          }) /* Empty result. */,
        ],
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
      });
      expect(() => {
        openRound(wcif, '333-r2');
      }).toThrow(
        new Error(
          'Cannot open this round as the previous has less than 8 competitors.'
        )
      );
    });

    test('throws an error if no one qualified', () => {
      const round1 = Round({
        id: '333-r1',
        results: [1, 2, 3, 4, 5, 6, 7, 8].map(personId =>
          Result({ ranking: 1, personId, attempts: [{ result: -1 }], best: -1 })
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
          ...[1, 2, 3, 4, 5, 6, 7, 8].map(n =>
            Result({ ranking: n, personId: n })
          ),
          Result({
            ranking: null,
            personId: 9,
            attempts: [],
            best: 0,
          }) /* Empty result. */,
          Result({
            ranking: null,
            personId: 10,
            attempts: [],
            best: 0,
          }) /* Empty result. */,
        ],
      });
      const round2 = Round({ id: '333-r2', results: [] });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
        persons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(registrantId =>
          Person({ registrantId })
        ),
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
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(n =>
          Result({ ranking: n, personId: n })
        ),
      ],
      advancementCondition: { type: 'ranking', level: 5 },
    });
    const round2 = Round({ id: '333-r2', results: [] });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
      persons: [1, 2, 3, 4, 5, 6, 7, 8].map(registrantId =>
        Person({ registrantId })
      ),
    });
    const updatedWcif = openRound(wcif, '333-r2');
    expect(
      updatedWcif.events[0].rounds[1].results.map(({ personId }) => personId)
    ).toEqual([1, 2, 3, 4, 5]);
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
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
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
    }).toThrow(
      new Error("Cannot quit competitor with id 2 as he's not in 333-r1.")
    );
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
      expect(
        updatedWcif.events[0].rounds[0].results.map(({ personId }) => personId)
      ).toEqual([2]);
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
        results: [Result({ personId: 1 }), Result({ personId: 2 })],
      });
      const wcif = Competition({
        events: [Event({ id: '333', rounds: [round1, round2] })],
        persons: [1, 2, 3, 4].map(registrantId => Person({ registrantId })),
      });
      const updatedWcif = quitCompetitor(wcif, '333-r2', 1, true);
      expect(
        updatedWcif.events[0].rounds[1].results.map(({ personId }) => personId)
      ).toEqual([2, 3, 4]);
    });
  });
});

describe('addCompetitor', () => {
  test('throws an error if the given competitor does not qualify to the given round', () => {
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
    expect(() => {
      addCompetitor(wcif, '333-r2', 4);
    }).toThrow(
      new Error(
        "Cannot add competitor with id 4 as he doesn't qualify to 333-r2."
      )
    );
  });

  test('adds an empty result for the given competitor', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ ranking: 1, personId: 1 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [
        Person({ registrantId: 1 }),
        Person({ registrantId: 2, registration: { status: 'accepted' } }),
      ],
    });
    const updatedWcif = addCompetitor(wcif, '333-r1', 2);
    expect(
      updatedWcif.events[0].rounds[0].results
        .map(({ personId }) => personId)
        .sort()
    ).toEqual([1, 2]);
  });

  test('removes excess results from the given round', () => {
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
      persons: [1, 2, 3, 4].map(registrantId => Person({ registrantId })),
    });
    const updatedWcif = addCompetitor(wcif, '333-r2', 2);
    expect(
      updatedWcif.events[0].rounds[1].results
        .map(({ personId }) => personId)
        .sort()
    ).toEqual([1, 2, 3]);
  });
});

describe('podiums', () => {
  test('ignores events with no rounds', () => {
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [] })],
    });
    expect(podiums(wcif).map(round => round.id)).toEqual([]);
  });

  test('returns final rounds only', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ ranking: 1, personId: 1 })],
    });
    const round2 = Round({
      id: '333-r2',
      results: [Result({ ranking: 1, personId: 1 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
    });
    expect(podiums(wcif).map(round => round.id)).toEqual(['333-r2']);
  });

  test('returns finished rounds only', () => {
    const round333 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, attempts: [], best: 0, average: 0 }),
      ],
    });
    const round222 = Round({
      id: '222-r1',
      results: [Result({ ranking: 1, personId: 1 })],
    });
    const wcif = Competition({
      events: [
        Event({ id: '333', rounds: [round333] }),
        Event({ id: '222', rounds: [round222] }),
      ],
    });
    expect(podiums(wcif).map(round => round.id)).toEqual(['222-r1']);
  });

  test('returned rounds include only podium results', () => {
    const round = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1 }),
        Result({ ranking: 2, personId: 2 }),
        Result({ ranking: 3, personId: 3 }),
        Result({ ranking: 3, personId: 4 }),
        Result({ ranking: 5, personId: 5 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round] })],
    });
    expect(podiums(wcif)[0].results.map(result => result.personId)).toEqual([
      1,
      2,
      3,
      4,
    ]);
  });

  test('does not return finished rounds with no complete results', () => {
    const round = Round({
      id: '333bf-r1',
      results: [
        Result({
          ranking: 1,
          personId: 1,
          attempts: [{ result: -1 }, { result: -1 }, { result: -1 }],
          best: -1,
          average: -1,
        }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333bf', rounds: [round] })],
    });
    expect(podiums(wcif)).toEqual([]);
  });

  describe('roundFinished', () => {
    test('returns false if the round has no results', () => {
      const round = Round({
        id: '333-r1',
        results: [],
      });
      expect(roundFinished(round)).toEqual(false);
    });

    test('returns true if all results are finished', () => {
      const round = Round({
        id: '333-r1',
        results: [
          Result({ ranking: 1, personId: 1 }),
          Result({ ranking: 2, personId: 2 }),
        ],
        cutoff: null,
      });
      expect(roundFinished(round)).toEqual(true);
    });

    test('returns true if few results are missing but the round is inactive', () => {
      const round = Round({
        id: '333-r1',
        results: [
          ...times(20, n =>
            Result({
              personId: n + 1,
              ranking: n + 1,
              updatedAt: new Date(Date.now() - 20 * 60 * 1000),
            })
          ),
          Result({
            personId: 21,
            attempts: [],
            updatedAt: new Date(Date.now() - 20 * 60 * 1000),
          }),
        ],
        cutoff: null,
      });
      expect(roundFinished(round)).toEqual(true);
    });

    test('returns false if few results are missing but the round is active', () => {
      const round = Round({
        id: '333-r1',
        results: [
          ...times(20, n =>
            Result({
              personId: n + 1,
              ranking: n + 1,
              updatedAt: new Date(Date.now() - 10 * 60 * 1000),
            })
          ),
          Result({
            personId: 21,
            attempts: [],
            updatedAt: new Date(Date.now() - 20 * 60 * 1000),
          }),
        ],
        cutoff: null,
      });
      expect(roundFinished(round)).toEqual(false);
    });
  });
});
