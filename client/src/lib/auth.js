import { getItem, setItem, removeItem } from './cached-local-storage';

const TOKEN_KEY = 'token';

/**
 * Reads an authentication token from local storage.
 */
export function getToken() {
  return getItem(TOKEN_KEY);
}

/**
 * Saves the given authentication token in local storage.
 */
export function storeToken(token) {
  setItem(TOKEN_KEY, token);
}

/**
 * Removes the given authentication token from local storage.
 */
export function clearToken() {
  removeItem(TOKEN_KEY);
}

/**
 * Checks if the current URL hash contains an authentication token,
 * in which case it saves the token in local storage and removes it from the URL.
 *
 * Should be called before any kind of router takes over the location.
 */
export function maybeGrabTokenFromUrl() {
  const hash = window.location.hash;
  if (hash.startsWith('#token=')) {
    const token = hash.replace('#token=', '');
    storeToken(token);
    removeHashFromUrl();
  }
}

function removeHashFromUrl() {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );
}
