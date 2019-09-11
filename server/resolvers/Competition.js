const { acceptedPeople } = require('../utils/wcif');
const { sortWcifEvents } = require('../utils/events');
const { competitionCountryIso2s } = require('../utils/wcif');
const { countryByIso2 } = require('../utils/countries');

module.exports = {
  id: ({ wcif }) => wcif.id,
  name: ({ wcif }) => wcif.shortName,
  events: ({ wcif }) => sortWcifEvents(wcif.events),
  schedule: ({ wcif }) => wcif.schedule,
  competitors: ({ wcif }) => acceptedPeople(wcif),
  countries: ({ wcif }) => competitionCountryIso2s(wcif).map(countryByIso2),
  synchronizedAt: ({ synchronizedAt }) => synchronizedAt.toISOString(),
};
