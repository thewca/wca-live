const { acceptedPeople } = require('../utils/wcif');
const { competitionCountryIso2s } = require('../utils/wcif');
const { countryByIso2 } = require('../utils/countries');
const { podiums } = require('../utils/rounds');
const { hasAccess } = require('../utils/competition');
const { withWcif } = require('./utils');

module.exports = {
  id: ({ wcif }) => {
    return wcif.id;
  },
  name: ({ wcif }) => {
    return wcif.shortName;
  },
  events: ({ wcif }) => {
    return wcif.events.map(withWcif(wcif));;
  },
  schedule: ({ wcif }) => {
    return withWcif(wcif)(wcif.schedule);
  },
  competitors: ({ wcif }) => {
    return acceptedPeople(wcif).map(withWcif(wcif));
  },
  countries: ({ wcif }) => {
    return competitionCountryIso2s(wcif).map(countryByIso2);
  },
  synchronizedAt: ({ synchronizedAt }) => {
    return synchronizedAt.toISOString();
  },
  podiums: ({ wcif }) => {
    return podiums(wcif).map(withWcif(wcif));
  },
  scoretakers: ({ wcif, scoretakerWcaUserIds }) => {
    return wcif.persons
      .filter(person => scoretakerWcaUserIds.includes(person.wcaUserId))
      .map(withWcif(wcif));;
  },
  passwordAuthEnabled: ({ encryptedPassword }) => {
    return !!encryptedPassword;
  },
  currentUserManagerAccess: (competition, args, { user, session }) => {
    return hasAccess('manager', competition, user, session);
  },
  currentUserScoretakerAccess: (competition, args, { user, session }) => {
    return hasAccess('scoretaker', competition, user, session);
  },
};
