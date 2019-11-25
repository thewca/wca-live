const { addDays } = require('../logic/date');
const { withWcif } = require('./utils');

module.exports = {
  endDate: ({ startDate, numberOfDays }) => {
    return addDays(startDate, numberOfDays - 1);
  },
  venues: ({ venues, wcif }) => {
    return venues.map(withWcif(wcif));
  },
};
