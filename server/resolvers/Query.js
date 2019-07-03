const { withAuthentication } = require('./middleware');
const { ObjectId } = require('mongodb');

module.exports = {
  me: withAuthentication(
    (parent, args, { user }) => user
  ),
};
