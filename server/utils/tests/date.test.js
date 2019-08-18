const { dateToString, addDays } = require('../date');

describe('dateToString', () => {
  test('returns date in yyyy-mm-dd format', () => {
    expect(dateToString(new Date(2014, 4, 15))).toEqual('2014-05-15');
  });
});

describe('addDays', () => {
  test('returns date in yyyy-mm-dd format after adding the given number of days', () => {
    expect(addDays('2014-02-15', 2)).toEqual('2014-02-17');
    expect(addDays('2014-01-30', 2)).toEqual('2014-02-01');
  });
});
