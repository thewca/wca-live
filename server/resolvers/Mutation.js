const { ObjectId } = require('mongodb');
const { getWcif } = require('../utils/wca-api');

module.exports = {
  importCompetition: async (parent, { competitionId }, { session, mongo: { Competitions, Users } }) => {
    const user = await Users.findOne({ _id: new ObjectId(session.userId) });

    const wcif = await getWcif(competitionId, user.oauth.accessToken);
    return { id: competitionId };
  }
};
