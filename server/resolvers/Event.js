const { eventNameById } = require('../utils/events');

module.exports = {
  name: ({ id }) => eventNameById(id),
};
