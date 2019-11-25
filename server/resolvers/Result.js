const { personById } = require('../logic/wcif');
const { withWcif } = require('./utils');

module.exports = {
  _id: ({ personId, round, wcif }) => {
    return `${wcif.id}:${round.id}:${personId}`;
  },
  person: ({ personId, wcif }) => {
    return withWcif(wcif)(personById(wcif, personId));
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
