const fetch = require('node-fetch');
const { WCA_ORIGIN } = require('../config');
const { refreshUserAccessToken } = require('./wca-oauth');

/* Returns functions sending requests to the WCA API.
   Requests are authorized with the given user's OAuth data.
   If OAuth access token is about to expire it refreshes it. */
module.exports = (user = null) => {
  const getMe = async () => {
    const { me } = await wcaApiFetch('/me');
    return me;
  };

  const getUpcomingManageableCompetitions = () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      managed_by_me: true,
      start: twoDaysAgo.toISOString(),
    });
    return wcaApiFetch(`/competitions?${params.toString()}`);
  };

  const getWcif = competitionId => {
    return wcaApiFetch(`/competitions/${competitionId}/wcif`);
  };

  const updateWcif = (competitionId, wcif) => {
    return wcaApiFetch(`/competitions/${competitionId}/wcif`, {
      method: 'PATCH',
      body: JSON.stringify(wcif),
    });
  };

  const getRecords = () => {
    return wcaApiFetch('/records');
  };

  const wcaApiFetch = async (path, fetchOptions = {}) => {
    if (user) {
      await refreshUserAccessToken(user);
    }
    const baseApiUrl = `${WCA_ORIGIN}/api/v0`;
    const options = {
      ...fetchOptions,
      headers: {
        Authorization: user ? `Bearer ${user.oauth.accessToken}` : null,
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(`${baseApiUrl}${path}`, options);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  };

  return {
    getMe,
    getUpcomingManageableCompetitions,
    getWcif,
    updateWcif,
    getRecords,
  };
};
