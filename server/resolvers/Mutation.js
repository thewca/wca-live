const { withAuthentication, withCompetition, withCompetitionAuthorization } = require('./middleware');
const { getWcif } = require('../utils/wca-api');
const { roundById } = require('../utils/wcif');
const { processRoundResults, openRound } = require('../utils/results');

const getDocument = ({ value }) => {
  if (!value) throw new Error('Document not found.');
  return value;
};

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { id }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(id, user.oauth.accessToken);
      const managerWcaUserIds = wcif.persons.filter(
        person => person.roles.some(role => ['delegate', 'organizer', 'staff-dataentry'].includes(role))
      ).map(person => person.wcaUserId);
      const competition = getDocument(
        await Competitions.findOneAndUpdate(
          { 'wcif.id': id },
          { $setOnInsert: { wcif, managerWcaUserIds } },
          { upsert: true, returnOriginal: false },
        )
      );
      return competition;
    }
  ),
  setResult: withCompetitionAuthorization(
    async (parent, { roundId, result }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      const currentResult = round.results.find(
        ({ personId }) => personId === parseInt(result.personId, 10)
      );
      currentResult.attempts = result.attempts.map(attempt => ({ result: attempt }));
      processRoundResults(round, competition.wcif);
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  ),
  openRound: withCompetitionAuthorization(
    async (parent, { roundId }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      openRound(round, competition.wcif);
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  ),
  clearRound: withCompetitionAuthorization(
    async (parent, { roundId }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      round.results = [];
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  ),
};
