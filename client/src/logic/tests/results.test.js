import { formatResult } from '../results';

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
