const { acceptedPeople, startDate, endDate } = require('../utils/wcif');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.name,
  events: ({ wcif }) => wcif.events,
  competitors: ({ wcif }) => acceptedPeople(wcif),
  startDate: ({ wcif }) => startDate(wcif),
  endDate: ({ wcif }) => endDate(wcif),
};
