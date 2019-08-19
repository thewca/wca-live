const { best, average } = require('../stats');

describe('best', () => {
  it('returns 0 (skipped) if all attempts are skipped', () => {
    expect(best([])).toEqual(0);
    expect(best([0, 0, 0])).toEqual(0);
    expect(best([0, 0, 0, 0, 0])).toEqual(0);
  });

  it('returns -1 (DNF) if there are non-skipped attempts, but none is successful', () => {
    expect(best([-1])).toEqual(-1);
    expect(best([-2])).toEqual(-1);
    expect(best([-1, -1, -2])).toEqual(-1);
    expect(best([-1, -1, 0, 0, 0])).toEqual(-1);
  });

  it('returns the best result if there are any successful attempts', () => {
    expect(best([1000])).toEqual(1000);
    expect(best([980, -1, -2])).toEqual(980);
    expect(best([1100, 1200, 980, 950, 890])).toEqual(890);
  });
});

describe('average', () => {
  it('throws an error if no event id is given', () => {
    expect(() => {
      average([1000, 1100, 1200]);
    }).toThrow('Missing argument: eventId');
  });

  it('throws an error for unsupported expected solve count', () => {
    expect(() => {
      average([1100, 1000, 900], '333', 4);
    }).toThrow('Invalid expected number of attempts: 4. Must be either 3 or 5.');
  });

  it('returns 0 (skipped) for 3x3x3 Multi-Blind', () => {
    expect(average([970360001, 970360001, 970360001], '333mbf', 3)).toEqual(0);
  });

  it('returns 0 (skipped) if there are less attempts than expected', () => {
    expect(average([1000, 1100, 1300], '333', 5)).toEqual(0);
  });

  it('returns 0 (skipped) if any attempt is skipped', () => {
    expect(average([1000, 1100, 1300, 0, 1200], '333', 5)).toEqual(0);
  });

  it('returns -1 (DNF) if any unsuccessful attempt is counting', () => {
    expect(average([980, -1, 1010], '333', 3)).toEqual(-1);
    expect(average([980, 900, -2], '333', 3)).toEqual(-1);
    expect(average([-1, 980, 890, -1, 910], '333', 5)).toEqual(-1);
    expect(average([-1, 980, -2, 890, 910], '333', 5)).toEqual(-1);
  });

  it('trims best and worst in case of 5 attempts', () => {
    expect(average([900, 800, 700, 4000, 600], '333', 5)).toEqual(800);
    expect(average([900, 800, 700, 1000, 300], '333', 5)).toEqual(800);
    expect(average([-1, 600, 600, 600, 500], '333', 5)).toEqual(600);
  });

  it('does not trim best and worst in case of 3 attempts', () => {
    expect(average([400, 500, 900], '333', 3)).toEqual(600);
  });

  it('rounds averages over 10 minutes to nearest second', () => {
    expect(average([60041, 60041, 60041], '333', 3)).toEqual(60000);
    expect(average([60051, 60051, 60051], '333', 3)).toEqual(60100);
  });

  it('returns correct average for 3x3x3 Fewest Moves', () => {
    expect(average([24, 25, 26], '333fm', 3)).toEqual(2500);
    expect(average([24, 24, 25], '333fm', 3)).toEqual(2433);
  });
});
