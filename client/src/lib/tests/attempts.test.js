import {
  formatAttemptResult,
  encodeMbldAttempt,
  validateMbldAttempt,
  meetsCutoff,
  attemptsWarning,
  applyTimeLimit,
  applyCutoff,
} from '../attempts';

describe('formatAttemptResult', () => {
  test('returns an empty string for value 0', () => {
    expect(formatAttemptResult(0, '333')).toEqual('');
  });

  test('returns DNF for value -1', () => {
    expect(formatAttemptResult(-1, '333')).toEqual('DNF');
  });

  test('returns DNS for value -2', () => {
    expect(formatAttemptResult(-2, '333')).toEqual('DNS');
  });

  test('strips leading zeros', () => {
    expect(formatAttemptResult(150, '333')).toEqual('1.50');
    expect(formatAttemptResult(60 * 100, '333')).toEqual('1:00.00');
    expect(formatAttemptResult(60 * 60 * 100 + 15, '333')).toEqual(
      '1:00:00.15'
    );
  });

  test('returns one leading zero for results under 1 second', () => {
    expect(formatAttemptResult(15, '333')).toEqual('0.15');
  });

  describe('when 3x3x3 Fewest Moves result is given', () => {
    test('formats single result correctly', () => {
      expect(formatAttemptResult(28, '333fm')).toEqual('28');
    });

    test('formats average result correctly', () => {
      expect(formatAttemptResult(2833, '333fm', true)).toEqual('28.33');
    });
  });

  describe('when 3x3x3 Multi-Blind result is given', () => {
    test('shows number of solved/attempted cubes and time without centiseconds', () => {
      expect(formatAttemptResult(900348002, '333mbf')).toEqual('11/13 58:00');
      expect(formatAttemptResult(970360001, '333mbf')).toEqual('3/4 1:00:00');
    });
  });
});

describe('encodeMbldAttempt', () => {
  test('correctly encodes DNF, DNS and skipped', () => {
    expect(encodeMbldAttempt({ centiseconds: 0 })).toEqual(0);
    expect(encodeMbldAttempt({ centiseconds: -1 })).toEqual(-1);
    expect(encodeMbldAttempt({ centiseconds: -2 })).toEqual(-2);
  });

  test('correctly encodes successful attempt', () => {
    const attempt = { solved: 11, attempted: 13, centiseconds: 3480 * 100 };
    expect(encodeMbldAttempt(attempt)).toEqual(900348002);
  });

  test('rounds centiseconds to seconds', () => {
    const attempt = {
      solved: 11,
      attempted: 13,
      centiseconds: 3480 * 100 + 50,
    };
    expect(encodeMbldAttempt(attempt)).toEqual(900348102);
  });
});

describe('validateMbldAttempt', () => {
  test('sets attempted to solved when attempted is 0', () => {
    const attempt = { solved: 2, attempted: 0, centiseconds: 6000 };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 2,
      attempted: 2,
      centiseconds: 6000,
    });
  });

  test('sets attempted to solved when more cubes are solved than attempted', () => {
    const attempt = { solved: 3, attempted: 2, centiseconds: 6000 };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 3,
      attempted: 3,
      centiseconds: 6000,
    });
  });

  test('returns dnf attempt if the number of points is less than 0', () => {
    const attempt = { solved: 2, attempted: 5, centiseconds: 6000 };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('returns dnf attempt for 1/2', () => {
    const attempt = { solved: 1, attempted: 2, centiseconds: 6000 };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('returns dnf attempt if the time limit is exceeded', () => {
    const attempt = { solved: 2, attempted: 3, centiseconds: 40 * 60 * 100 };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test('allows 30 seconds over the time limit for +2s', () => {
    const attempt = {
      solved: 2,
      attempted: 3,
      centiseconds: 30 * 60 * 100 + 30 * 100,
    };
    expect(validateMbldAttempt(attempt)).toEqual({
      solved: 2,
      attempted: 3,
      centiseconds: 30 * 60 * 100 + 30 * 100,
    });
  });

  test('returns the same attempt if everything is ok', () => {
    const attempt = { solved: 11, attempted: 12, centiseconds: 60 * 60 * 100 };
    expect(validateMbldAttempt(attempt)).toEqual({
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

  it('returns true if one of attempts before cutoff is better than cutoff value', () => {
    const attempts = [1000, 850, 0, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(true);
  });

  it('returns false if one of further attempts is better than cutoff', () => {
    const attempts = [1000, 950, 800, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(false);
  });

  it('requires attempts better than the cutoff', () => {
    const attempts = [900, 700, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 700 };
    expect(meetsCutoff(attempts, cutoff)).toEqual(false);
  });
});

describe('attemptsWarning', () => {
  const normalize = (string) => string.replace(/\s+/g, ' ');

  describe('when 3x3x3 Multi-Blind attempts are given', () => {
    it('returns a warning if an attempt has impossibly low time', () => {
      const attempts = [970360001, 970006001];
      expect(normalize(attemptsWarning(attempts, '333mbf'))).toMatch(
        'attempt 2 is done in less than 30 seconds per cube tried'
      );
    });
  });

  it('returns a warning if best and worst attempt are far apart', () => {
    const attempts = [500, 1000, 2500];
    expect(normalize(attemptsWarning(attempts, '333'))).toMatch(
      "There's a big difference between the best single (5.00) and the worst single (25.00)"
    );
  });

  it('returns null if attempts do not look suspicious', () => {
    const attempts = [900, 1000, 800];
    expect(attemptsWarning(attempts, '333')).toEqual(null);
  });

  it('does not treat DNF as being far apart from other attempts', () => {
    const attempts = [-1, 1000, 2500];
    expect(attemptsWarning(attempts, '333')).toEqual(null);
  });

  it('returns a warning if an attempt is omitted', () => {
    const attempts = [1000, 0, 900];
    expect(attemptsWarning(attempts, '333')).toMatch(
      "You've omitted attempt 2"
    );
  });

  it('doas not treat trailing skipped attempts as omitted', () => {
    const attempts = [1000, 0, 0];
    expect(attemptsWarning(attempts, '333')).toEqual(null);
  });
});

describe('applyTimeLimit', () => {
  it('4th attempt becomes DNF because of exceeding time limit', () => {
    const attempts = [1000, 1100, 1200, 1300, 0];
    const timeLimit = {
      cumulativeRoundIds: [],
      centiseconds: 1250,
    };
    expect(applyTimeLimit(attempts, timeLimit)).toEqual([
      1000,
      1100,
      1200,
      -1,
      0,
    ]);
  });

  it('3rd attempt becomes DNF because of exceeding cumulative time limit', () => {
    const attempts = [3000, 13000, 5000];
    const timeLimit = {
      cumulativeRoundIds: ['333bf'],
      centiseconds: 20000,
    };
    expect(applyTimeLimit(attempts, timeLimit)).toEqual([3000, 13000, -1]);
  });
});

describe('applyCutoff', () => {
  it('3rd attempt becomes skipped because the first two attempts did not meet cutoff', () => {
    const attempts = [1000, 1100, 1200, 0, 0];
    const cutoff = {
      numberOfAttempts: 2,
      attemptResult: 800,
    };
    const eventId = '333bf';
    expect(applyCutoff(attempts, cutoff, eventId)).toEqual([
      1000,
      1100,
      0,
      0,
      0,
    ]);
  });
});
