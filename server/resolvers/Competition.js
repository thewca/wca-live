const { addDays } = require('../utils/date');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.name,
  events: ({ wcif }) => wcif.events,
  competitors: ({ wcif }) => {
    return wcif.persons.filter(({ registration }) =>
      registration && registration.status === 'accepted'
    );
  },
  startDate: ({ wcif }) => wcif.schedule.startDate,
  endDate: ({ wcif }) => addDays(wcif.schedule.startDate, wcif.schedule.numberOfDays - 1),
};
