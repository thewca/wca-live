const { getRecentManageableCompetitions } = require('../utils/wca-api');

module.exports = {
  id: (parent) => parent._id,
  importableCompetitions: async (parent) => {
    const competitions = await getRecentManageableCompetitions(parent.oauth.accessToken);
    return competitions.map(({ id, name }) => ({
      id,
      name,
    }));
  },
};
