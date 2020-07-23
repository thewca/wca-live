export const signInUrl =
  process.env.NODE_ENV === 'production'
    ? '/oauth/authorize'
    : 'http://localhost:4000/oauth/authorize';
