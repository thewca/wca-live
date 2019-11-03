const fetch = require('node-fetch');
const {
  WCA_OAUTH_CLIENT_ID,
  WCA_OAUTH_SECRET,
  WCA_ORIGIN,
  WCA_OAUTH_REDIRECT_URI,
} = require('../config');
const { db } = require('../mongo-connector');

const authorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    redirect_uri: WCA_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'public manage_competitions',
  });
  return `${WCA_ORIGIN}/oauth/authorize?${params.toString()}`;
};

const oauthDataFromCode = async code => {
  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    client_secret: WCA_OAUTH_SECRET,
    redirect_uri: WCA_OAUTH_REDIRECT_URI,
    code,
    grant_type: 'authorization_code',
  });
  const tokenResponse = await fetch(
    `${WCA_ORIGIN}/oauth/token?${params.toString()}`,
    { method: 'POST' }
  );
  return tokenResponseJsonToOauthData(await tokenResponse.json());
};

const refreshUserAccessToken = async user => {
  /* Refresh the token only if it expires in less than 5 minutes. */
  if (user.oauth.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    const params = new URLSearchParams({
      client_id: WCA_OAUTH_CLIENT_ID,
      client_secret: WCA_OAUTH_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.oauth.refreshToken,
    });
    const tokenResponse = await fetch(
      `${WCA_ORIGIN}/oauth/token?${params.toString()}`,
      { method: 'POST' }
    );
    user.oauth = tokenResponseJsonToOauthData(await tokenResponse.json());
    await db.users.findOneAndUpdate(
      { wcaUserId: user.wcaUserId },
      { $set: user }
    );
  }
};

const tokenResponseJsonToOauthData = tokenResponseJson => {
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  } = tokenResponseJson;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  return { accessToken, refreshToken, expiresAt };
};

module.exports = {
  authorizationUrl,
  oauthDataFromCode,
  refreshUserAccessToken,
};
