export const signInUrl =
  process.env.NODE_ENV === 'production'
    ? '/oauth/sign-in'
    : 'http://localhost:4000/oauth/sign-in';
