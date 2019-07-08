const { withAuthentication } = require('./middleware');
const { getWcif } = require('../utils/wca-api');

const getDocument = ({ value }) => {
  if (!value) throw new Error('Document not found.');
  return value;
};

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { competitionId }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(competitionId, user.oauth.accessToken);
      const managerWcaUserIds = wcif.persons.filter(
        person => person.roles.some(role => ['delegate', 'organizer', 'staff-dataentry'].includes(role))
      ).map(person => person.wcaUserId);
      const competition = getDocument(
        await Competitions.findOneAndUpdate(
          { 'wcif.id': competitionId },
          { $setOnInsert: { wcif, managerWcaUserIds } },
          { upsert: true, returnOriginal: false },
        )
      );
      return competition.wcif;
    }
  )
};
