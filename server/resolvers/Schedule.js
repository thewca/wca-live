const { addDays } = require('../utils/date');

module.exports = {
  endDate: ({ startDate, numberOfDays }) => {
    return addDays(startDate, numberOfDays - 1);
  },
};
