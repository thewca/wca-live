const { acceptedPeople } = require('../utils/wcif');
const { competitionCountryIso2s } = require('../utils/wcif');
const { countryByIso2 } = require('../utils/countries');
const { podiums } = require('../utils/rounds');
const { hasAccess } = require('../utils/competition');

module.exports = {
  id: ({ wcif }) => {
    return wcif.id;
  },
  name: ({ wcif }) => {
    return wcif.shortName;
  },
  events: ({ wcif }) => {
    return wcif.events;
  },
  schedule: ({ wcif }) => {
    return wcif.schedule;
  },
  competitors: ({ wcif }) => {
    return acceptedPeople(wcif);
  },
  countries: ({ wcif }) => {
    return competitionCountryIso2s(wcif).map(countryByIso2);
  },
  synchronizedAt: ({ synchronizedAt }) => {
    return synchronizedAt.toISOString();
  },
  podiums: ({ wcif }) => {
    return podiums(wcif);
  },
  scoretakers: ({ wcif, scoretakerWcaUserIds }) => {
    return wcif.persons.filter(person =>
      scoretakerWcaUserIds.includes(person.wcaUserId)
    );
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
