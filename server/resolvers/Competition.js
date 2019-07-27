const { acceptedPeople, startDate, endDate } = require('../utils/wcif');
const { sortWcifEvents } = require('../utils/events');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.shortName,
  events: ({ wcif }) => sortWcifEvents(wcif.events),
  competitors: ({ wcif }) => acceptedPeople(wcif),
  startDate: ({ wcif }) => startDate(wcif),
  endDate: ({ wcif }) => endDate(wcif),
};
