const { withWcif } = require('./utils');

module.exports = {
  _id: ({ id, wcif }) => {
    return `${wcif.id}:${id}`;
  },
  activities: ({ activities, wcif }) => {
    return activities.map(withWcif(wcif));
  },
};
