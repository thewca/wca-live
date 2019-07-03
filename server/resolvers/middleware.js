const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');

const withAuthentication = resolver => async (parent, args, context) => {
  const { session, mongo: { Users } } = context;
  const user = await Users.findOne({ _id: new ObjectId(session.userId) });
  if (!user) throw new AuthenticationError('Not authorized.');
  return resolver(parent, args, { ...context, user });
};

module.exports = {
  withAuthentication,
};
