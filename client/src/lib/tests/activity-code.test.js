import { parseActivityCode } from '../activity-code';

describe('parseActivityCode', () => {
  describe('official WCA activity codes', () => {
    test('returns type official and information about each part', () => {
      expect(parseActivityCode('333-r1-g2-a1')).toEqual({
        type: 'official',
        eventId: '333',
        roundNumber: 1,
        groupName: '2',
        attemptNumber: 1,
      });
    });

    test('returns null for attributes missing in a less specific activity code', () => {
      expect(parseActivityCode('333-r1-g2')).toEqual({
        type: 'official',
        eventId: '333',
        roundNumber: 1,
        groupName: '2',
        attemptNumber: null,
      });
      expect(parseActivityCode('333-r1')).toEqual({
        type: 'official',
        eventId: '333',
        roundNumber: 1,
        groupName: null,
        attemptNumber: null,
      });
      expect(parseActivityCode('333')).toEqual({
        type: 'official',
        eventId: '333',
        roundNumber: null,
        groupName: null,
        attemptNumber: null,
      });
      expect(parseActivityCode('333-r1-a2')).toEqual({
        type: 'official',
        eventId: '333',
        roundNumber: 1,
        groupName: null,
        attemptNumber: 2,
      });
    });
  });

  describe('other activity codes', () => {
    test('returns type other and id', () => {
      expect(parseActivityCode('other-lunch')).toEqual({
        type: 'other',
        id: 'lunch',
      });
      expect(parseActivityCode('other-misc-chess')).toEqual({
        type: 'other',
        id: 'misc-chess',
      });
    });
  });

  test('throws an error when the given activity code is neither official nor other', () => {
    expect(() => {
      parseActivityCode('invalid-code');
    }).toThrow(new Error("Invalid activity code: 'invalid-code'."));
  });
});
