const express = require('express');
const fetch = require('node-fetch');
const { PRODUCTION, WCA_OAUTH_CLIENT_ID, WCA_OAUTH_SECRET, WCA_ORIGIN, WCA_OAUTH_REDIRECT_URI } = require('./config');
const { getMe }  = require('./utils/wca-api');

const userJsonToUser = userJson => ({
  wcaUserId: userJson['id'],
  wcaId: userJson['wca_id'],
  name: userJson['name'],
  avatar: {
    url: userJson['avatar']['url'],
    thumbUrl: userJson['avatar']['thumb_url'],
  },
});

module.exports = ({ Users }) => {
  const router = express.Router();

  router.get('/sign-in', (req, res) => {
    const params = new URLSearchParams({
      client_id: WCA_OAUTH_CLIENT_ID,
      redirect_uri: WCA_OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: 'public manage_competitions',
    });
    res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
  });

  router.get('/callback', async (req, res) => {
    const params = new URLSearchParams({
      client_id: WCA_OAUTH_CLIENT_ID,
      client_secret: WCA_OAUTH_SECRET,
      redirect_uri: WCA_OAUTH_REDIRECT_URI,
      code: req.query.code,
      grant_type: 'authorization_code',
    });
    const tokenResponse = await fetch(`${WCA_ORIGIN}/oauth/token?${params.toString()}`, { method: 'POST' });
    const { access_token: accessToken } = await tokenResponse.json();
    const me = await getMe(accessToken);
    const user = {
      ...userJsonToUser(me),
      oauth: { accessToken },
    };
    const { value: dbUser } = await Users.findOneAndUpdate(
      { wcaUserId: user.wcaUserId },
      { $set: user },
      { upsert: true, returnOriginal: false }
    );
    req.session.userId = dbUser._id;
    res.redirect('/admin');
  });

  router.get('/sign-out', (req, res) => {
    req.session.destroy();
    res.end();
  });

  return router;
};
