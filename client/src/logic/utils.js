export const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);

export const setAt = (array, index, value) => [
  ...array.slice(0, index),
  value,
  ...array.slice(index + 1),
];

export const times = (n, fn) =>
  Array.from({ length: n }, (_, index) => fn(index));

export const toInt = string => parseInt(string, 10) || null;

export const updateIn = (object, [property, ...properyChain], updater) =>
  properyChain.length === 0
    ? { ...object, [property]: updater(object[property]) }
    : {
        ...object,
        [property]: updateIn(object[property], properyChain, updater),
      };

export const groupBy = (arr, fn) =>
  arr.reduce((obj, x) => updateIn(obj, [fn(x)], xs => [...(xs || []), x]), {});

export const uniq = arr => [...new Set(arr)];

export const sortCompare = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

export const sortBy = (arr, fn) =>
  arr.slice().sort((x, y) => sortCompare(fn(x), fn(y)));

export const formatDateRange = (startString, endString) => {
  const start = new Date(startString);
  const end = new Date(endString);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startString === endString) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const firstPart =
    startYear === endYear
      ? `${startMonth} ${startDay}`
      : `${startMonth} ${startDay}, ${startYear}`;

  const secondPart =
    startMonth === endMonth
      ? `${endDay}, ${endYear}`
      : `${endMonth} ${endDay}, ${endYear}`;

  return `${firstPart} - ${secondPart}`;
};

export const trimTrailingZeros = array => {
  if (array.length === 0) return [];
  return array[array.length - 1] === 0
    ? trimTrailingZeros(array.slice(0, -1))
    : array;
};
