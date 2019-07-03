const fetch = require('node-fetch');
const { WCA_ORIGIN } = require('../config');

module.exports = {
  id: (parent) => parent._id,
  importableCompetitions: async (parent) => {
    const oneMonthAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      managed_by_me: true,
      start: oneMonthAgo.toISOString()
    });
    const response = await fetch(`${WCA_ORIGIN}/api/v0/competitions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${parent.oauth.accessToken}` }
    });
    const competitions = await response.json();
    return competitions.map(({ id, name }) => ({
      id,
      name,
    }));
  },
};
