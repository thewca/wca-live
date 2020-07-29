/**
 * A simple abstraction over `localStorage` with in-memory cache.
 */

const cache = {};

export function getItem(key) {
  if (key in cache) return cache[key];
  const value = localStorage.getItem(localStorageKey(key));
  cache[key] = value;
  return value;
}

export function setItem(key, value) {
  cache[key] = value;
  localStorage.setItem(localStorageKey(key), value);
}

export function removeItem(key) {
  delete cache[key];
  localStorage.removeItem(localStorageKey(key));
}

function localStorageKey(key) {
  return `wca-live:${key}`;
}
