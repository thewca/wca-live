export function flatMap(arr, fn) {
  return arr.reduce((acc, x) => acc.concat(fn(x)), []);
}

export function setAt(arr, index, value) {
  return arr.map((x, i) => (i === index ? value : x));
}

export function times(n, fn) {
  return Array.from({ length: n }, (_, index) => fn(index));
}

export function toInt(string) {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) return null;
  return number;
}

export function groupBy(arr, fn) {
  return arr.map(fn).reduce((acc, val, i) => {
    acc[val] = (acc[val] || []).concat(arr[i]);
    return acc;
  }, {});
}

export function uniq(arr) {
  return [...new Set(arr)];
}

export function orderBy(arr, fns, orders = []) {
  if (typeof fns === "function") {
    fns = [fns];
  }
  if (typeof orders === "string") {
    orders = [orders];
  }

  return arr.slice(0).sort((a, b) =>
    fns.reduce((acc, fn, i) => {
      if (acc === 0) {
        const fnA = fn(a);
        const fnB = fn(b);
        const result = fnA > fnB ? 1 : fnA < fnB ? -1 : 0;
        acc = orders[i] === "desc" ? -result : result;
      }
      return acc;
    }, 0)
  );
}

export function partition(arr, fn) {
  return arr.reduce(
    (acc, val, i, arr) => {
      acc[fn(val, i, arr) ? 0 : 1].push(val);
      return acc;
    },
    [[], []]
  );
}

export function min(arr) {
  return arr.reduce((x, y) => (x < y ? x : y));
}

export function max(arr) {
  return arr.reduce((x, y) => (x > y ? x : y));
}

export function minBy(arr, fn) {
  return arr.reduce((x, y) => (fn(x) < fn(y) ? x : y));
}

export function toggleElement(arr, x) {
  return arr.includes(x) ? arr.filter((y) => y !== x) : [x, ...arr];
}

export function clamp(x, left, right) {
  return Math.min(Math.max(x, left), right);
}

export function formatSentence(message) {
  return capitalize(message).replace(/\.?$/, ".");
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
