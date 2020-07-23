export const SKIPPED_VALUE = 0;
export const DNF_VALUE = -1;
export const DNS_VALUE = -2;

export function centisecondsToClockFormat(centiseconds) {
  if (!Number.isFinite(centiseconds)) return null;
  if (centiseconds === SKIPPED_VALUE) return '';
  if (centiseconds === DNF_VALUE) return 'DNF';
  if (centiseconds === DNS_VALUE) return 'DNS';
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
}

export function decodeMbldAttemptResult(value) {
  if (value <= 0) return { solved: 0, attempted: 0, centiseconds: value };
  const missed = value % 100;
  const seconds = Math.floor(value / 100) % 1e5;
  const points = 99 - (Math.floor(value / 1e7) % 100);
  const solved = points + missed;
  const attempted = solved + missed;
  const centiseconds = seconds === 99999 ? null : seconds * 100;
  return { solved, attempted, centiseconds };
}

export function encodeMbldAttemptResult({ solved, attempted, centiseconds }) {
  if (centiseconds <= 0) return centiseconds;
  const missed = attempted - solved;
  const points = solved - missed;
  const seconds = Math.round(
    (centiseconds || 9999900) / 100
  ); /* 99999 seconds is used for unknown time. */
  return (99 - points) * 1e7 + seconds * 1e2 + missed;
}

export function mbldAttemptToPoints(attempt) {
  const { solved, attempted } = decodeMbldAttemptResult(attempt);
  const missed = attempted - solved;
  return solved - missed;
}

export function formatAttemptResult(attemptResult, eventId) {
  if (attemptResult === SKIPPED_VALUE) return '';
  if (attemptResult === DNF_VALUE) return 'DNF';
  if (attemptResult === DNS_VALUE) return 'DNS';
  if (eventId === '333fm') return formatFmAttemptResult(attemptResult);
  if (eventId === '333mbf') return formatMbldAttemptResult(attemptResult);
  return centisecondsToClockFormat(attemptResult);
}

function formatMbldAttemptResult(attemptResult) {
  const { solved, attempted, centiseconds } = decodeMbldAttemptResult(
    attemptResult
  );
  const clockFormat = centisecondsToClockFormat(centiseconds);
  const shortClockFormat = clockFormat.replace(/\.00$/, '');
  return `${solved}/${attempted} ${shortClockFormat}`;
}

function formatFmAttemptResult(attemptResult) {
  /* Note: FM singles are stored as the number of moves (e.g. 25),
     while averages are stored with 2 decimal places (e.g. 2533 for an average of 25.33 moves). */
  const isAverage = attemptResult >= 1000;
  return isAverage
    ? (attemptResult / 100).toFixed(2)
    : attemptResult.toString();
}

export function meetsCutoff(attemptResults, cutoff) {
  if (!cutoff) return true;
  const { numberOfAttempts, attemptResult } = cutoff;
  return attemptResults
    .slice(0, numberOfAttempts)
    .some((attempt) => attempt > 0 && attempt < attemptResult);
}
