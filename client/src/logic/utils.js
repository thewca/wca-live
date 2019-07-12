export const setAt = (array, index, value) =>
  [...array.slice(0, index), value, ...array.slice(index + 1)];

export const times = (n, fn) =>
  Array.from({ length: n }, (_, index) => fn(index));

export const toInt = string =>
  parseInt(string, 10) || null;

export const centisecondsToClockFormat = centiseconds => {
  if (!Number.isFinite(centiseconds)) return null;
  if (centiseconds === 0) return '';
  if (centiseconds === -1) return 'DNF';
  if (centiseconds === -2) return 'DNS';
  return new Date(centiseconds * 10).toISOString().substr(11, 11).replace(/^[0:]*(?!\.)/g, '');
}

export const preventDefault = fn => event => {
  event.preventDefault();
  fn();
};
