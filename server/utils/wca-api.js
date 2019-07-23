const fetch = require('node-fetch');
const { WCA_ORIGIN } = require('../config');

const getMe = async (accessToken) => {
  const { me } = await wcaApiFetch('/me', accessToken);
  return me;
};

const getRecentManageableCompetitions = (accessToken) => {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: true,
    start: oneMonthAgo.toISOString(),
  });
  return wcaApiFetch(`/competitions?${params.toString()}`, accessToken);
};

const getWcif = (competitionId, accessToken) =>
  wcaApiFetch(`/competitions/${competitionId}/wcif`, accessToken);

const updateWcif = (competitionId, wcif, accessToken) =>
  wcaApiFetch(`/competitions/${competitionId}/wcif`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(wcif)
  });

const getRecords = () => wcaApiFetch('/records');

const wcaApiFetch = async (path, accessToken, fetchOptions = {}) => {
  const baseApiUrl = `${WCA_ORIGIN}/api/v0`;
  const options = {
    ...fetchOptions,
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  };
  const response = await fetch(`${baseApiUrl}${path}`, options);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

module.exports = {
  getMe,
  getRecentManageableCompetitions,
  getWcif,
  getRecords,
};
