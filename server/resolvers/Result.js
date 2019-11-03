const { personById } = require('../logic/wcif');

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
};
