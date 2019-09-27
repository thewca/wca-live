const { db } = require('../mongo-connector');
const wcaApi = require('../utils/wca-api');
const { countryByIso2 } = require('../utils/countries');

module.exports = {
  id: (parent) => parent._id,
  importableCompetitions: async (parent, args) => {
    const competitions = await wcaApi(parent).getUpcomingManageableCompetitions();
    const importedCompetitions = await db.competitions.find({}).project({ 'wcif.id': 1 }).toArray();
    const importedCompetitionIds = importedCompetitions.map(competition => competition.wcif.id);
    return competitions
      .filter(competition => competition.announced_at)
      .filter(competition => !importedCompetitionIds.includes(competition.id))
      .map(({ id, name, short_name, start_date, end_date, country_iso2 }) => ({
        wcif: {
          id,
          name: name,
          shortName: short_name,
          events: [],
          schedule: {
            startDate: start_date,
            numberOfDays: new Date(end_date).getDate() - new Date(start_date).getDate() + 1,
            venues: countryByIso2(country_iso2)
              ? [{ countryIso2: country_iso2 }]
              : [] /* Ignore invalid iso2 (e.g. if the coutry is 'Multiple Countries') */,
          }
        },
      }));
  },
  manageableCompetitions: async (parent, args) => {
    return await db.competitions
      .find({ managerWcaUserIds: parent.wcaUserId })
      .sort({ 'wcif.schedule.startDate': 1, 'wcif.schedule.numberOfDays': 1 })
      .toArray();
  },
};
