export const signInUrl =
  process.env.NODE_ENV === 'production'
    ? '/oauth/sign-in'
    : 'http://localhost:4000/oauth/sign-in';

export const signOut = () => {
  if (process.env.NODE_ENV === 'production') {
    return fetch('/oauth/sign-out', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } else {
    return fetch('http://localhost:4000/oauth/sign-out', {
      method: 'POST',
      credentials: 'include',
      mode: 'no-cors',
    });
  }
};
