const { db } = require('../mongo-connector');
const wcaApi = require('../logic/wca-api');
const { countryByIso2 } = require('../logic/countries');

/**
 * Converts competition JSON from the WCA competitions API to conform to the appropriate structure.
 */
const competitionJsonToCompetition = ({
  id, name, short_name, start_date, end_date, country_iso2
}) => ({
  wcif: {
    id,
    name: name,
    shortName: short_name,
    events: [],
    persons: [],
    schedule: {
      startDate: start_date,
      numberOfDays:
        new Date(end_date).getDate() - new Date(start_date).getDate() + 1,
      venues: country_iso2 && countryByIso2(country_iso2)
        ? [{ countryIso2: country_iso2 }]
        : [] /* Ignore invalid iso2 (e.g. if the coutry is 'Multiple Countries') */,
    },
  },
})

module.exports = {
  id: parent => parent._id,
  importableCompetitions: async (parent) => {
    const competitions = await wcaApi(
      parent
    ).getUpcomingManageableCompetitions();
    const importedCompetitionIds = await db.competitions
      .find({})
      .project({ 'wcif.id': 1 })
      .map(competition => competition.wcif.id)
      .toArray();
    return competitions
      .filter(competition => competition.announced_at)
      .filter(competition => !importedCompetitionIds.includes(competition.id))
      .map(competitionJsonToCompetition);
  },
  manageableCompetitions: async (parent) => {
    return await db.competitions
      .find({
        $or: [
          { managerWcaUserIds: parent.wcaUserId },
          { scoretakerWcaUserIds: parent.wcaUserId },
        ],
      })
      .sort({ 'wcif.schedule.startDate': 1, 'wcif.schedule.numberOfDays': 1 })
      .toArray();
  },
};
