const { withAuthentication } = require('./middleware');
const { getWcif } = require('../utils/wca-api');

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { competitionId }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(competitionId, user.oauth.accessToken);
      return { id: competitionId };
    }
  )
};
