export const setAt = (array, index, value) =>
  [...array.slice(0, index), value, ...array.slice(index + 1)];

export const times = (n, fn) =>
  Array.from({ length: n }, (_, index) => fn(index));

export const toInt = string =>
  parseInt(string, 10) || null;

export const updateIn = (object, [property, ...properyChain], updater) =>
  properyChain.length === 0
    ? { ...object, [property]: updater(object[property]) }
    : { ...object, [property]: updateIn(object[property], properyChain, updater) };

export const groupBy = (arr, fn) =>
  arr.reduce((obj, x) =>
    updateIn(obj, [fn(x)], xs => (xs || []).concat(x))
  , {});
