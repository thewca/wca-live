const { addDays } = require('../logic/date');

module.exports = {
  endDate: ({ startDate, numberOfDays }) => {
    return addDays(startDate, numberOfDays - 1);
  },
};
