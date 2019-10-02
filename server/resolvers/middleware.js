const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const competitionLoader = require('../competition-loader');
const { hasAccess } = require('../utils/competition');

const withCompetition = resolver => async (parent, args, context) => {
  context.competition = await competitionLoader.get(args.competitionId || args.id);
  if (!context.competition) {
    throw new Error('Competition not found.');
  }
  return resolver(parent, args, context);
};

const withCompetitionAuthorization = (role, resolver) => withCompetition(
  async (parent, args, context) => {
    const { competition, user, session } = context;
    if (!hasAccess(role, competition, user, session)) {
      throw new AuthenticationError('Not authorized.');
    }
    return resolver(parent, args, context);
  }
);

module.exports = {
  withCompetition,
  withCompetitionAuthorization,
};
