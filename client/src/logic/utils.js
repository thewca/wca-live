export const setAt = (array, index, value) =>
  [...array.slice(0, index), value, ...array.slice(index + 1)];

export const times = (n, fn) =>
  Array.from({ length: n }, (_, index) => fn(index));

export const toInt = string =>
  parseInt(string, 10) || null;
