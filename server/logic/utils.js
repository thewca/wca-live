const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);

const zip = (...arrs) =>
  arrs.length === 0 ? [] : arrs[0].map((_, i) => arrs.map(arr => arr[i]));

const firstResult = (arr, fn) =>
  arr.reduce((result, x) => result || fn(x), null);

const sortCompare = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

const sortByArray = (arr, fn) => {
  const values = new Map(
    arr.map(x => [x, fn(x)])
  ); /* Compute every value once. */
  return arr
    .slice()
    .sort((x, y) =>
      firstResult(zip(values.get(x), values.get(y)), ([a, b]) =>
        sortCompare(a, b)
      )
    );
};

const sortBy = (arr, fn) =>
  arr.slice().sort((x, y) => sortCompare(fn(x), fn(y)));

const partition = (xs, fn) => [xs.filter(fn), xs.filter(x => !fn(x))];

const uniq = arr => [...new Set(arr)];

const times = (n, fn) => Array.from({ length: n }, (_, index) => fn(index));

const haveSameElements = (array1, array2) => {
  if (array1.length !== array2.length) return false;
  return array1.every(item => array2.includes(item));
};

const updateIn = (object, [property, ...properyChain], updater) => {
  return properyChain.length === 0
    ? { ...object, [property]: updater(object[property]) }
    : {
        ...object,
        [property]: updateIn(object[property], properyChain, updater),
      };
};

const groupBy = (arr, fn) => {
  return arr.reduce(
    (obj, x) => updateIn(obj, [fn(x)], xs => (xs || []).concat(x)),
    {}
  );
};


module.exports = {
  flatMap,
  zip,
  sortByArray,
  sortBy,
  partition,
  uniq,
  times,
  haveSameElements,
  groupBy,
};
