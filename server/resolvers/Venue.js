const { addDays } = require('../utils/date');

module.exports = {
  latitude: ({ latitudeMicrodegrees }) => {
    return latitudeMicrodegrees / 1e6;
  },
  longitude: ({ longitudeMicrodegrees }) => {
    return longitudeMicrodegrees / 1e6;
  },
};
