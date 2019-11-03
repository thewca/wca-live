const { eventNameById } = require('../utils/events');
const { withWcif } = require('./utils');

module.exports = {
  name: ({ id }) => {
    return eventNameById(id);
  },
  rounds: ({ rounds, wcif }) => {
    return rounds.map(withWcif(wcif));
  },
};
