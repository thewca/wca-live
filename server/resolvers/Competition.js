const { acceptedPeople, startDate, endDate } = require('../utils/wcif');
const { sortWcifEvents } = require('../utils/events');
const { competitionCountryIso2s } = require('../utils/wcif');
const { countryByIso2 } = require('../utils/countries');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.shortName,
  events: ({ wcif }) => sortWcifEvents(wcif.events),
  competitors: ({ wcif }) => acceptedPeople(wcif),
  startDate: ({ wcif }) => startDate(wcif),
  endDate: ({ wcif }) => endDate(wcif),
  countries: ({ wcif }) => competitionCountryIso2s(wcif).map(countryByIso2),
  synchronizedAt: ({ synchronizedAt }) => synchronizedAt.toISOString(),
};
