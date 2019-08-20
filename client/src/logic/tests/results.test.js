import {
  formatResult,
  encodeMbldResult,
  validateMbldResult,
  meetsCutoff,
  attemptsWarning,
} from '../results';

describe('formatResult', () => {
  test('returns an empty string for value 0', () => {
    expect(formatResult(0, '333')).toEqual('');
  });

  test('returns DNF for value -1', () => {
    expect(formatResult(-1, '333')).toEqual('DNF');
  });

  test('returns DNS for value -2', () => {
    expect(formatResult(-2, '333')).toEqual('DNS');
  });

  test('strips leading zeros', () => {
    expect(formatResult(150, '333')).toEqual('1.50');
    expect(formatResult(60 * 100, '333')).toEqual('1:00.00');
    expect(formatResult(60 * 60 * 100 + 15, '333')).toEqual('1:00:00.15');
  });

  test('returns one leading zero for results under 1 second', () => {
    expect(formatResult(15, '333')).toEqual('0.15');
  });

  describe('when 3x3x3 Fewest Moves result is given', () => {
    test('formats single result correctly', () => {
      expect(formatResult(28, '333fm')).toEqual('28');
    });

    test('formats average result correctly', () => {
      expect(formatResult(2833, '333fm', true)).toEqual('28.33');
    });
  });

  describe('when 3x3x3 Multi-Blind result is given', () => {
    test('shows number of solved/attempted cubes and time without centiseconds', () => {
      expect(formatResult(900348002, '333mbf')).toEqual('11/13 58:00');
      expect(formatResult(970360001, '333mbf')).toEqual('3/4 1:00:00');
    });
  });
});

describe('encodeMbldResult', () => {
  test('correctly encodes DNF, DNS and skipped', () => {
    expect(encodeMbldResult({ centiseconds: 0 })).toEqual(0);
    expect(encodeMbldResult({ centiseconds: -1 })).toEqual(-1);
    expect(encodeMbldResult({ centiseconds: -2 })).toEqual(-2);
  });

  test('correctly encodes successful result', () => {
    const result = { solved: 11, attempted: 13, centiseconds: 3480 * 100 };
    expect(encodeMbldResult(result)).toEqual(900348002);
  });

  test('rounds centiseconds to seconds', () => {
    const result = { solved: 11, attempted: 13, centiseconds: 3480 * 100 + 50 };
    expect(encodeMbldResult(result)).toEqual(900348102);
  });
});

describe('validateMbldResult', () => {
  test('sets attempted to solved when attempted is 0', () => {
    const result = { solved: 2, attempted: 0, centiseconds: 6000 };
    expect(validateMbldResult(result)).toEqual({
      solved: 2,
      attempted: 2,
      centiseconds: 6000,
    });
  });

  test('sets attempted to solved when more cubes are solved than attempted', () => {
    const result = { solved: 3, attempted: 2, centiseconds: 6000 };
    expect(validateMbldResult(result)).toEqual({
      solved: 3,
      attempted: 3,
      centiseconds: 6000,
    });
  });

  test('returns dnf result if the number of points is less than 0', () => {
    const result = { solved: 2, attempted: 5, centiseconds: 6000 };
    expect(validateMbldResult(result)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('returns dnf result for 1/2', () => {
    const result = { solved: 1, attempted: 2, centiseconds: 6000 };
    expect(validateMbldResult(result)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('returns dnf result if the time limit is exceeded', () => {
    const result = { solved: 2, attempted: 3, centiseconds: 40 * 60 * 100 };
    expect(validateMbldResult(result)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('returns the same result if everything is ok', () => {
    const result = { solved: 11, attempted: 12, centiseconds: 60 * 60 * 100 };
    expect(validateMbldResult(result)).toEqual({
      solved: 11,
      attempted: 12,
      centiseconds: 60 * 60 * 100,
    });
  });
});

describe('meetsCutoff', () => {
  it('returns true when no cutoff is given', () => {
    const attempts = [-1, -1];
    expect(meetsCutoff(attempts, null)).toEqual(true);
  });

  it('returns true if one of cutoff results is better than cutoff', () => {
    const attempts = [1000, 850, 0, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(true);
  });

  it('returns false if one of further results is better than cutoff', () => {
    const attempts = [1000, 950, 800, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(false);
  });

  it('requires results better than the cutoff', () => {
    const attempts = [900, 700, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 700 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(false);
  });
});

describe('attemptsWarning', () => {
  const normalize = string => string.replace(/\s+/g, ' ');

  describe('when 3x3x3 Multi-Blind results are given', () => {
    it('returns a warning if an attempt has impossibly low time', () => {
      const attempts = [970360001, 970006001];
      expect(normalize(attemptsWarning(attempts, '333mbf'))).toMatch(
        'attempt 2 is done in less than 30 seconds per cube tried'
      );
    });
  });

  it('returns a warning if best and worst result are far apart', () => {
    const attempts = [500, 1000, 2500];
    expect(normalize(attemptsWarning(attempts, '333'))).toMatch(
      "There's a big difference between the best single (5.00) and the worst single (25.00)"
    );
  });

  it('returns null if results do not look suspicious', () => {
    const attempts = [900, 1000, 800];
    expect(attemptsWarning(attempts, '333')).toEqual(null);
  });

  it('does not treat DNF as being far apart from other results', () => {
    const attempts = [-1, 1000, 2500];
    expect(attemptsWarning(attempts, '333')).toEqual(null);
  });
});
