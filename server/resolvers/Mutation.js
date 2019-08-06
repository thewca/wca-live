const { withAuthentication, withCompetition, withCompetitionAuthorization } = require('./middleware');
const pubsub = require('./pubsub');
const { getWcif } = require('../utils/wca-api');
const { roundById } = require('../utils/wcif');
const { updateResult, openRound, clearRound, quitCompetitor } = require('../utils/results');
const { synchronize } = require('../utils/competition');

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { id }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(id, user.oauth.accessToken);
      const managerWcaUserIds = wcif.persons.filter(
        person => person.roles.some(role => ['delegate', 'organizer', 'staff-dataentry'].includes(role))
      ).map(person => person.wcaUserId);
      const { value: competition } = await Competitions.findOneAndUpdate(
        { 'wcif.id': id },
        { $setOnInsert: { wcif, managerWcaUserIds } },
        { upsert: true, returnOriginal: false },
      );
      return competition;
    }
  ),
  setResult: withCompetitionAuthorization(
    async (parent, { competitionId, roundId, result }, context) => {
      const { competitionLoader } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const attempts = result.attempts.map(attempt => ({ result: attempt }));
        const personId = parseInt(result.personId, 10);
        const updatedWcif = updateResult(competition.wcif, roundId, personId, attempts);
        const updatedRound = roundById(updatedWcif, roundId);
        pubsub.publish('ROUND_UPDATE', { roundUpdate: updatedRound, competitionId, roundId });
        context.competition = await competitionLoader.update(
          { ...competition, wcif: updatedWcif },
          { resultsOnly: true }
        );
        return updatedRound;
      });
    }
  ),
  openRound: withCompetitionAuthorization(
    async (parent, { competitionId, roundId }, context) => {
      const { competitionLoader } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedWcif = openRound(competition.wcif, roundId);
        context.competition = await competitionLoader.update(
          { ...competition, wcif: updatedWcif },
          { resultsOnly: true }
        );
        return roundById(updatedWcif, roundId);
      });
    }
  ),
  clearRound: withCompetitionAuthorization(
    async (parent, { competitionId, roundId }, context) => {
      const { competitionLoader } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedWcif = clearRound(competition.wcif, roundId);
        context.competition = await competitionLoader.update(
          { ...competition, wcif: updatedWcif },
          { resultsOnly: true }
        );
        return roundById(updatedWcif, roundId);
      });
    }
  ),
  quitCompetitor: withCompetitionAuthorization(
    async (parent, { competitionId, roundId, competitorId, replace }, context) => {
      const { competitionLoader } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedWcif = quitCompetitor(competition.wcif, roundId, parseInt(competitorId, 10), replace);
        context.competition = await competitionLoader.update(
          { ...competition, wcif: updatedWcif },
          { resultsOnly: true }
        );
        return roundById(updatedWcif, roundId);
      });
    }
  ),
  synchronize: withCompetitionAuthorization(
    async (parent, { competitionId }, context) => {
      const { competitionLoader, user } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedWcif = await synchronize(competition.wcif, user.oauth.accessToken);
        context.competition = await competitionLoader.update({ ...competition, wcif: updatedWcif });
        return context.competition;
      });
    }
  ),
};
