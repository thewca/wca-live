const records = require('../records');
records.getRecordByIdCopy = jest.fn();
beforeEach(() => {
  records.getRecordByIdCopy.mockImplementation(() => {
    throw new Error('Missing mocked records value.');
  });
});

const { Result, Competition, Event, Round, Person } = require('./wcif-builders');
const { updateRanking, updateRecordTags, sortedResults, resultFinished } = require('../results');

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

describe('updateRecordTags', () => {
  beforeEach(() => {
    records.getRecordByIdCopy.mockReturnValue({
      '333-single-world': 500,
      '333-average-world': 600,
      '333-single-_Europe': 600,
      '333-average-_Europe': 700,
      '333-single-United Kingdom': 700,
      '333-average-United Kingdom': 800,
    });
  });

  const person = Person({
    registrantId: 1,
    countryIso2: 'GB',
    personalBests: [
      { eventId: '333', type: 'single', best: 800 },
      { eventId: '333', type: 'average', best: 900 },
    ],
  });

  test('sets null tags if no there is no record', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 850, average: 950 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: null, average: null
    });
  });

  test('sets personal records correctly', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 750, average: 850 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'PB', average: 'PB'
    });
  });

  test('sets national records correctly', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 650, average: 750 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'NR', average: 'NR'
    });
  });

  test('sets continental records correctly', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 550, average: 650 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'CR', average: 'CR'
    });
  });

  test('sets world records correctly', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 450, average: 550 })],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'WR', average: 'WR'
    });
  });

  test('sets only one record of the given type in the given round', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ personId: 1, best: 480, average: 550 }),
        Result({ personId: 2, best: 450, average: 580 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [1, 2].map(registrantId => Person({
        registrantId,
        countryIso2: 'GB',
        personalBests: [
          { eventId: '333', type: 'single', best: 800 },
          { eventId: '333', type: 'average', best: 900 },
        ],
      })),
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'PB', average: 'WR'
    });
    expect(updatedWcif.events[0].rounds[0].results[1].recordTags).toEqual({
      single: 'WR', average: 'PB'
    });
  });

  test('allows record of the same type in many rounds', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ personId: 1, best: 480, average: 580 }),
      ],
    });
    const round2 = Round({
      id: '333-r2',
      results: [
        Result({ personId: 1, best: 450, average: 550 }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1, round2] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'WR', average: 'WR'
    });
    expect(updatedWcif.events[0].rounds[1].results[0].recordTags).toEqual({
      single: 'WR', average: 'WR'
    });
  });

  test('if there is no record of the specific type, any complete result is treated as a record', () => {
    const round1 = Round({
      id: '333-r1',
      results: [Result({ personId: 1, best: 2000, average: -1 })],
    });
    const person = Person({
      registrantId: 1,
      countryIso2: 'US', /* Note: there are no records for either USA and North America. */
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [person],
    });
    const updatedWcif = updateRecordTags(wcif, '333-r1');
    expect(updatedWcif.events[0].rounds[0].results[0].recordTags).toEqual({
      single: 'CR', average: null
    });
  });
});

describe('sortedResults', () => {
  test('orders by ranking', () => {
    const result1 = Result({ personId: 1, ranking: 2, });
    const result2 = Result({ personId: 2, ranking: 3, });
    const result3 = Result({ personId: 3, ranking: 1, });
    const wcif = Competition({
      persons: [1, 2, 3].map(registrantId => Person({ registrantId })),
    });
    const results = [result1, result2, result3];
    expect(sortedResults(results, wcif)).toEqual([
      result3, result1, result2,
    ]);
  });

  test('orders by name people with the same ranking', () => {
    const result1 = Result({ personId: 1, ranking: 1, });
    const result2 = Result({ personId: 2, ranking: 1, });
    const result3 = Result({ personId: 3, ranking: 1, });
    const wcif = Competition({
      persons: [
        Person({ registrantId: 1, name: 'Sherlock' }),
        Person({ registrantId: 2, name: 'John' }),
        Person({ registrantId: 3, name: 'Mary' }),
      ],
    });
    const results = [result1, result2, result3];
    expect(sortedResults(results, wcif)).toEqual([
      result2, result3, result1,
    ]);
  });

  test('compares non-latin characters in names correctly', () => {
    const result1 = Result({ personId: 1, ranking: 1, });
    const result2 = Result({ personId: 2, ranking: 1, });
    const result3 = Result({ personId: 3, ranking: 1, });
    const wcif = Competition({
      persons: [
        Person({ registrantId: 1, name: 'Łukasz' }),
        Person({ registrantId: 2, name: 'Lucas' }),
        Person({ registrantId: 3, name: 'Zack' }),
      ],
    });
    const results = [result1, result2, result3];
    expect(sortedResults(results, wcif)).toEqual([
      result2, result1, result3,
    ]);
  });
});

describe('resultFinished', () => {
  test('returns true if the result has all attempts', () => {
    const result = Result({ personId: 1, attempts: [{ result: 24 }, { result: 25 }, { result: 22 }] });
    expect(resultFinished(result, 3, null)).toEqual(true);
  });

  test('returns false if the result does not have all attempts', () => {
    const result = Result({ personId: 1, attempts: [{ result: 24 }, { result: 25 }] });
    expect(resultFinished(result, 3, null)).toEqual(false);
  });

  test('returns true if the result has all cutoff times and does not meet cutoff', () => {
    const result = Result({ personId: 1, attempts: [{ result: 24 }] });
    const cutoff = { attemptResult: 23, numberOfAttempts: 1 };
    expect(resultFinished(result, 3, cutoff)).toEqual(true);
  });

  test('returns false if the result only has the cutoff times but meets cutoff', () => {
    const result = Result({ personId: 1, attempts: [{ result: 24 }] });
    const cutoff = { attemptResult: 25, numberOfAttempts: 1 };
    expect(resultFinished(result, 3, cutoff)).toEqual(false);
  });
});
