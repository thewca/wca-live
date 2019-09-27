const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const competitionLoader = require('../competition-loader');

const withCompetition = resolver => async (parent, args, context) => {
  context.competition = await competitionLoader.get(args.competitionId || args.id);
  return resolver(parent, args, context);
};

const withCompetitionAuthorization = (role, resolver) => withCompetition(
  async (parent, args, context) => {
    const { user, competition, session } = context;
    if (role === 'manager') {
      if (!competition.managerWcaUserIds.includes(user.wcaUserId)) {
        throw new AuthenticationError('Not authorized.');
      }
    } else if (role === 'scoretaker') {
      const passwordSession =
        session.competitionId === competition._id.toString()
        && session.encryptedPassword === competition.encryptedPassword;
      const authorizedIds = [...competition.scoretakerWcaUserIds, ...competition.managerWcaUserIds];
      if (!passwordSession && !authorizedIds.includes(user.wcaUserId)) {
        throw new AuthenticationError('Not authorized.');
      }
    } else {
      throw new Error(`Unrecognised role: ${role}`)
    }
    return resolver(parent, args, context);
  }
);

module.exports = {
  withCompetition,
  withCompetitionAuthorization,
};
