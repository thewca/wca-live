const { withAuthentication } = require('./middleware');
const { ObjectId } = require('mongodb');

module.exports = {
  me: async (parent, args, { session, mongo: { Users } }) => {
    return await Users.findOne({ _id: new ObjectId(session.userId) });
  },
};
