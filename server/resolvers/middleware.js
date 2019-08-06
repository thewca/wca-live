const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');

const withAuthentication = resolver => async (parent, args, context) => {
  const { session, mongo: { Users } } = context;
  context.user = await Users.findOne({ _id: new ObjectId(session.userId) });
  if (!context.user) throw new AuthenticationError('Not authorized.');
  return resolver(parent, args, context);
};

const withCompetition = resolver => async (parent, args, context) => {
  const { competitionLoader } = context;
  context.competition = await competitionLoader.get(args.competitionId || args.id);
  return resolver(parent, args, context);
};

const withCompetitionAuthorization = resolver => withAuthentication(withCompetition(
  async (parent, args, context) => {
    const { user, competition } = context;
    if (!competition.managerWcaUserIds.includes(user.wcaUserId)) {
      throw new AuthenticationError('Not authorized.');
    }
    return resolver(parent, args, context);
  }
));

module.exports = {
  withAuthentication,
  withCompetition,
  withCompetitionAuthorization,
};
