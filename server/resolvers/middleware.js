const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');

const withAuthentication = resolver => async (parent, args, context) => {
  const { session, mongo: { Users } } = context;
  context.user = await Users.findOne({ _id: new ObjectId(session.userId) });
  if (!context.user) throw new AuthenticationError('Not authorized.');
  return resolver(parent, args, context);
};

const withCompetition = resolver => async (parent, args, context) => {
  const { mongo: { Competitions } } = context;
  context.competition = await Competitions.findOne({
    'wcif.id': args.competitionId || args.id
  });
  return resolver(parent, args, context);
};

module.exports = {
  withAuthentication,
  withCompetition,
};
