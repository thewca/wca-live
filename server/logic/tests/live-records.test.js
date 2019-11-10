const {
  Result,
  Competition,
  Event,
  Round,
  Person,
} = require('./wcif-builders');
const { computeRecords } = require('../live-records');

describe('computeRecords', () => {
  test('does not include personal records', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: 'WR', average: null } }),
        Result({ ranking: 2, personId: 2, recordTags: { single: 'PB', average: 'PB' } }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [Person({ registrantId: 1 }), Person({ registrantId: 2 })],
    });
    const records = computeRecords([{ wcif }]);
    expect(records.length).toEqual(1);
    expect(records[0].recordTag).toEqual('WR');
    expect(records[0].type).toEqual('single');
    expect(records[0].result.personId).toEqual(1);
  });

  test('returns single and average records separately', () => {
    const round1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: 'WR', average: 'CR' } }),
      ],
    });
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [round1] })],
      persons: [Person({ registrantId: 1 })]
    });
    const records = computeRecords([{ wcif }]);
    expect(records.length).toEqual(2);
    expect(records[0].recordTag).toEqual('WR');
    expect(records[1].recordTag).toEqual('CR');
  });

  test('returns best record if many records have the same type', () => {
    const roundComp1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: null, average: 'NR' }, average: 900 }),
      ],
    });
    const wcif1 = Competition({
      id: 'FirstComp2019',
      events: [Event({ id: '333', rounds: [roundComp1] })],
      persons: [Person({ registrantId: 1, countryIso2: 'GB' })],
    });
    const roundComp2 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: null, average: 'NR' }, average: 800 })
      ],
    });
    const wcif2 = Competition({
      id: 'SecondComp2019',
      events: [Event({ id: '333', rounds: [roundComp2] })],
      persons: [Person({ registrantId: 1, countryIso2: 'GB' })],
    });
    const records = computeRecords([{ wcif: wcif1 }, { wcif: wcif2 }]);
    expect(records.length).toEqual(1);
    expect(records[0].recordTag).toEqual('NR');
    expect(records[0].competition.wcif.id).toEqual('SecondComp2019');
    expect(records[0].result.personId).toEqual(1);
  });

  test('returns many records of the same type if they have the same attempt result', () => {
    const roundComp1 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: null, average: 'NR' }, average: 900 }),
      ],
    });
    const wcif1 = Competition({
      id: 'FirstComp2019',
      events: [Event({ id: '333', rounds: [roundComp1] })],
      persons: [Person({ registrantId: 1, countryIso2: 'GB' })],
    });
    const roundComp2 = Round({
      id: '333-r1',
      results: [
        Result({ ranking: 1, personId: 1, recordTags: { single: null, average: 'NR' }, average: 900 })
      ],
    });
    const wcif2 = Competition({
      id: 'SecondComp2019',
      events: [Event({ id: '333', rounds: [roundComp2] })],
      persons: [Person({ registrantId: 1, countryIso2: 'GB' })],
    });
    const records = computeRecords([{ wcif: wcif1 }, { wcif: wcif2 }]);
    expect(records.length).toEqual(2);
    expect(records[0].recordTag).toEqual('NR');
    expect(records[1].recordTag).toEqual('NR');
  });
});
