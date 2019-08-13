const express = require('express');
const { db } = require('./mongo-connector');
const wcaApi  = require('./utils/wca-api');
const { authorizationUrl, oauthDataFromCode }  = require('./utils/wca-oauth');

const userJsonToUser = userJson => ({
  wcaUserId: userJson['id'],
  wcaId: userJson['wca_id'],
  name: userJson['name'],
  avatar: {
    url: userJson['avatar']['url'],
    thumbUrl: userJson['avatar']['thumb_url'],
  },
});

const router = express.Router();

router.get('/sign-in', (req, res) => {
  res.redirect(authorizationUrl());
});

router.get('/callback', async (req, res) => {
  const oauth = await oauthDataFromCode(req.query.code);
  const me = await wcaApi({ oauth }).getMe();
  const user = { ...userJsonToUser(me), oauth };
  const { value: dbUser } = await db.users.findOneAndUpdate(
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

module.exports = router;
