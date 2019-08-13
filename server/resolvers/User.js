const { db } = require('../mongo-connector');
const wcaApi = require('../utils/wca-api');

module.exports = {
  id: (parent) => parent._id,
  importableCompetitions: async (parent, args) => {
    const competitions = await wcaApi(parent).getRecentManageableCompetitions();
    const importedCompetitions = await db.competitions.find({}).project({ 'wcif.id': 1 }).toArray();
    const importedCompetitionIds = importedCompetitions.map(competition => competition.wcif.id);
    return competitions
      .filter(competition => !importedCompetitionIds.includes(competition.id))
      .map(({ id, name, short_name, start_date, end_date }) => ({
        wcif: {
          id,
          name: name,
          shortName: short_name,
          events: [],
          schedule: {
            startDate: start_date,
            numberOfDays: new Date(end_date).getDate() - new Date(start_date).getDate() + 1,
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
