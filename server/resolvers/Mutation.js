const { withAuthentication, withCompetition, withCompetitionAuthorization } = require('./middleware');
const { getWcif } = require('../utils/wca-api');
const { roundById } = require('../utils/wcif');
const { setRankings, sortResults, setAdvancable, finishRound } = require('../utils/results');
const { processWcif } = require('../utils/competition');

const getDocument = ({ value }) => {
  if (!value) throw new Error('Document not found.');
  return value;
};

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { id }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(id, user.oauth.accessToken);
      processWcif(wcif);
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
      return competition.wcif;
    }
  ),
  setResult: withCompetitionAuthorization(
    async (parent, { roundId, result }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      const currentResult = round.results.find(
        ({ personId }) => personId === parseInt(result.personId, 10)
      );
      currentResult.attempts = result.attempts.map(attempt => ({ result: attempt }));
      setRankings(round.results, round.format);
      round.results = sortResults(round.results, competition.wcif);
      setAdvancable(round.results, round.advancementCondition); /* TODO: handle noshows */
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  ),
  finishRound: withCompetitionAuthorization(
    async (parent, { roundId, result }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      finishRound(round, competition.wcif);
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  ),
};
