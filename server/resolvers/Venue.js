const { addDays } = require('../logic/date');
const { withWcif } = require('./utils');

module.exports = {
  _id: ({ id, wcif }) => {
    return `${wcif.id}:${id}`;
  },
  latitude: ({ latitudeMicrodegrees }) => {
    return latitudeMicrodegrees / 1e6;
  },
  longitude: ({ longitudeMicrodegrees }) => {
    return longitudeMicrodegrees / 1e6;
  },
  rooms: ({ rooms, wcif }) => {
    return rooms.map(withWcif(wcif));
  },
};
