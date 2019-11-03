const { personById } = require('../logic/wcif');
const { withWcif } = require('./utils');

module.exports = {
  person: ({ personId, wcif }) => {
    return personById(wcif, personId);
  },
  attempts: ({ attempts }) => {
    return attempts.map(({ result }) => result);
  },
  updatedAt: ({ updatedAt }) => {
    return updatedAt.toISOString();
  },
  round: ({ round, wcif }) => {
    return withWcif(wcif)(round);
  },
};
