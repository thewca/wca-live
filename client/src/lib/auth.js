import { getItem, setItem, removeItem } from './cached-local-storage';

const TOKEN_KEY = 'token';

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function storeToken(token) {
  setItem(TOKEN_KEY, token);
}

export function clearToken() {
  removeItem(TOKEN_KEY);
}

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
