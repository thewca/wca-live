// TODO: replace with some fast library

export const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);

export const setAt = (array, index, value) => [
  ...array.slice(0, index),
  value,
  ...array.slice(index + 1),
];

export const times = (n, fn) =>
  Array.from({ length: n }, (_, index) => fn(index));

export const toInt = (string) => parseInt(string, 10) || null;

export const updateIn = (object, [property, ...properyChain], updater) =>
  properyChain.length === 0
    ? { ...object, [property]: updater(object[property]) }
    : {
        ...object,
        [property]: updateIn(object[property], properyChain, updater),
      };

export const groupBy = (arr, fn) =>
  arr.reduce(
    (obj, x) => updateIn(obj, [fn(x)], (xs) => [...(xs || []), x]),
    {}
  );

export const uniq = (arr) => [...new Set(arr)];

export const sortCompare = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

export const sortBy = (arr, fn) =>
  arr.slice().sort((x, y) => sortCompare(fn(x), fn(y)));

const zip = (...arrs) =>
  arrs.length === 0 ? [] : arrs[0].map((_, i) => arrs.map((arr) => arr[i]));

const firstResult = (arr, fn) =>
  arr.reduce((result, x) => result || fn(x), null);

export function sortByArray(arr, fn) {
  const values = new Map(
    arr.map((x) => [x, fn(x)])
  ); /* Compute every value once. */
  return arr
    .slice()
    .sort((x, y) =>
      firstResult(zip(values.get(x), values.get(y)), ([a, b]) =>
        sortCompare(a, b)
      )
    );
}

export const partition = (xs, fn) => [xs.filter(fn), xs.filter((x) => !fn(x))];
