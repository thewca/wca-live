const { getRecentManageableCompetitions } = require('../utils/wca-api');

module.exports = {
  id: (parent) => parent._id,
  importableCompetitions: async (parent, args, { mongo: { Competitions } }) => {
    const competitions = await getRecentManageableCompetitions(parent.oauth.accessToken);
    const importedCompetitions = await Competitions.find({}).project({ 'wcif.id': 1 }).toArray();
    const importedCompetitionIds = importedCompetitions.map(competition => competition.wcif.id);
    return competitions
      .filter(competition => !importedCompetitionIds.includes(competition.id))
      .map(({ id, name }) => ({ id, name}));
  },
  manageableCompetitions: async (parent, args, { mongo: { Competitions } }) => {
    const competitions = await Competitions.find({
      managerWcaUserIds: parent.wcaUserId,
    }).toArray();
    return competitions.map(competition => competition.wcif);
  },
};
