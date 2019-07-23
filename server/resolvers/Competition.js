const { startDate, endDate } = require('../utils/wcif');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.name,
  events: ({ wcif }) => wcif.events,
  competitors: ({ wcif }) => {
    return wcif.persons.filter(({ registration }) =>
      registration && registration.status === 'accepted'
    );
  },
  startDate: ({ wcif }) => startDate(wcif),
  endDate: ({ wcif }) => endDate(wcif),
};
