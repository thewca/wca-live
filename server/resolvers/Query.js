const { withAuthentication, withCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { roundById } = require('../utils/wcif');

module.exports = {
  me: async (parent, args, { session, mongo: { Users } }) => {
    return await Users.findOne({ _id: new ObjectId(session.userId) });
  },
  competition: withCompetition(
    async (parent, args, { competition }) => {
      return competition.wcif;
    }
  ),
  round: withCompetition(
    async (parent, { roundId }, { competition }) => {
      return roundById(competition.wcif, roundId);
    }
  ),
};
