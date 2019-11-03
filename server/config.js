const requiredEnvVariables = [
  'PORT',
  'MONGO_URI',
  'COOKIES_SECRET',
  'WCA_OAUTH_CLIENT_ID',
  'WCA_OAUTH_SECRET',
  'WCA_ORIGIN',
  'WCA_OAUTH_REDIRECT_URI',
];

if (process.env.NODE_ENV === 'production') {
  const missingEnvVariables = requiredEnvVariables.filter(
    variable => process.env[variable] === undefined
  );
  if (missingEnvVariables.length > 0) {
    throw new Error(`
      Missing environment variables: ${missingEnvVariables.join(', ')}.
      Please update the .env file.
    `);
  }
}

module.exports = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 4000,
  MONGO_URI:
    process.env.MONGO_URI || 'mongodb://localhost:27017/wca-live-development',
  SESSION_SECRET: process.env.COOKIES_SECRET || 'cats-the-sweetest-thing',
  WCA_OAUTH_CLIENT_ID:
    process.env.WCA_OAUTH_CLIENT_ID || 'example-application-id',
  WCA_OAUTH_SECRET: process.env.WCA_OAUTH_SECRET || 'example-secret',
  WCA_ORIGIN:
    process.env.WCA_ORIGIN || 'https://staging.worldcubeassociation.org',
  WCA_OAUTH_REDIRECT_URI:
    process.env.WCA_OAUTH_REDIRECT_URI ||
    'http://localhost:4000/oauth/callback',
};
