const records = require('../records');
records.getRecordByIdCopy = jest.fn(() => ({}));

const { synchronizeWcif } = require('../competition');
const {
  Result,
  Competition,
  Event,
  Round,
  Person,
} = require('./wcif-builders');

describe('synchronizeWcif', () => {
  test('takes round information from the new WCIF', () => {
    const oldRound1 = Round({
      id: '333-r1',
      advancementCondition: { type: 'ranking', level: 3 },
      cutoff: null,
      timeLimit: 1000,
    });
    const oldWcif = Competition({
      events: [Event({ id: '333', rounds: [oldRound1] })],
    });
    const newRound1 = Round({
      id: '333-r1',
      advancementCondition: { type: 'percent', level: 50 },
      cutoff: { numberOfAttempts: 2, attemptResult: 900 },
      timeLimit: 800,
    });
    const newWcif = Competition({
      events: [Event({ id: '333', rounds: [newRound1] })],
    });
    const updatedWcif = synchronizeWcif(oldWcif, newWcif);
    const updatedRound = updatedWcif.events[0].rounds[0];
    expect(updatedRound.advancementCondition).toEqual({ type: 'percent', level: 50 });
    expect(updatedRound.cutoff).toEqual({ numberOfAttempts: 2, attemptResult: 900 });
    expect(updatedRound.timeLimit).toEqual(800);
  });

  test('takes all results from the old (local) WCIF', () => {
    const oldRound1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1 })],
    });
    const oldWcif = Competition({
      events: [Event({ id: '333', rounds: [oldRound1] })],
      persons: [Person({ registrantId: 1 })],
    });
    const newRound1 = Round({
      id: '333-r1',
      results: [], /* The new WCIF has no results. */
    });
    const newWcif = Competition({
      events: [Event({ id: '333', rounds: [newRound1] })],
      persons: [Person({ registrantId: 1 })],
    });
    const updatedWcif = synchronizeWcif(oldWcif, newWcif);
    const updatedRound = updatedWcif.events[0].rounds[0];
    expect(updatedRound.results.length).toEqual(1);
  });

  describe('registration event changes', () => {
    test('adds an empty result when a registration event is added and the first round is open', () => {
      const oldRound1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 })],
      });
      const oldWcif = Competition({
        events: [Event({ id: '333', rounds: [oldRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222'] } }),
        ],
      });
      const newRound1 = Round({
        id: '333-r1',
        results: [],
      });
      const newWcif = Competition({
        events: [Event({ id: '333', rounds: [newRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222', '333'] /* Added 3x3x3. */ } }),
        ],
      });
      const updatedWcif = synchronizeWcif(oldWcif, newWcif);
      const updatedRound = updatedWcif.events[0].rounds[0];
      expect(updatedRound.results.length).toEqual(2);
      expect(updatedRound.results.map(result => result.personId)).toEqual([1, 2]);
    });

    test('does not add empty results when unapproved registration events change', () => {
      const oldRound1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 })],
      });
      const oldWcif = Competition({
        events: [Event({ id: '333', rounds: [oldRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222'], status: 'pending' } }),
        ],
      });
      const newRound1 = Round({
        id: '333-r1',
        results: [],
      });
      const newWcif = Competition({
        events: [Event({ id: '333', rounds: [newRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222', '333'], status: 'pending' } }),
        ],
      });
      const updatedWcif = synchronizeWcif(oldWcif, newWcif);
      const updatedRound = updatedWcif.events[0].rounds[0];
      expect(updatedRound.results.length).toEqual(1);
    });

    test('does not add an empty result when a registration event is added and the first round is not open', () => {
      const oldRound1 = Round({
        id: '333-r1',
        results: [],
      });
      const oldWcif = Competition({
        events: [Event({ id: '333', rounds: [oldRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222'] } }),
        ],
      });
      const newRound1 = Round({
        id: '333-r1',
        results: [],
      });
      const newWcif = Competition({
        events: [Event({ id: '333', rounds: [newRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222', '333'] /* Added 3x3x3. */ } }),
        ],
      });
      const updatedWcif = synchronizeWcif(oldWcif, newWcif);
      const updatedRound = updatedWcif.events[0].rounds[0];
      expect(updatedRound.results).toEqual([]);
    });

    test('does not add an empty result when a registration event is added and the first round is closed (next one is open)', () => {
      const oldRound1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 })],
      });
      const oldRound2 = Round({
        id: '333-r2',
        results: [Result({ personId: 1 })],
      });
      const oldWcif = Competition({
        events: [Event({ id: '333', rounds: [oldRound1, oldRound2] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222'] } }),
        ],
      });
      const newRound1 = Round({ id: '333-r1', results: [] });
      const newRound2 = Round({ id: '333-r2', results: [] });
      const newWcif = Competition({
        events: [Event({ id: '333', rounds: [newRound1, newRound2] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['222', '333'] /* Added 3x3x3. */ } }),
        ],
      });
      const updatedWcif = synchronizeWcif(oldWcif, newWcif);
      const [updatedRound1, updatedRound2] = updatedWcif.events[0].rounds;
      expect(updatedRound1.results.length).toEqual(1);
      expect(updatedRound2.results.length).toEqual(1);
    });

    test('adds an empty result when a new registration is added and the first round is open', () => {
      const oldRound1 = Round({
        id: '333-r1',
        results: [Result({ personId: 1 })],
      });
      const oldWcif = Competition({
        events: [Event({ id: '333', rounds: [oldRound1] })],
        persons: [
          Person({ registrantId: 1 }),
        ],
      });
      const newRound1 = Round({
        id: '333-r1',
        results: [],
      });
      const newWcif = Competition({
        events: [Event({ id: '333', rounds: [newRound1] })],
        persons: [
          Person({ registrantId: 1 }),
          Person({ registrantId: 2, registration: { eventIds: ['333'] } }),
        ],
      });
      const updatedWcif = synchronizeWcif(oldWcif, newWcif);
      const updatedRound = updatedWcif.events[0].rounds[0];
      expect(updatedRound.results.length).toEqual(2);
    });
  });
});
