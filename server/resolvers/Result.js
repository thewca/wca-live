const { personById } = require('../utils/wcif');

module.exports = {
  person: ({ personId }, args, { competition }) => {
    return personById(competition.wcif, personId);
  },
  attempts: ({ attempts }) => {
    return attempts.map(({ result }) => result);
  },
  updatedAt: ({ updatedAt }) => {
    return updatedAt.toISOString();
  },
};
