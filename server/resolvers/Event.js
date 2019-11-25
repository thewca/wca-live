const { eventNameById } = require('../logic/events');
const { withWcif } = require('./utils');

module.exports = {
  _id: ({ id, wcif }) => {
    return `${wcif.id}:${id}`;
  },
  name: ({ id }) => {
    return eventNameById(id);
  },
  rounds: ({ rounds, wcif }) => {
    return rounds.map(withWcif(wcif));
  },
};
