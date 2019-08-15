const { withAuthentication, withCompetition, withCompetitionAuthorization } = require('./middleware');
const { db } = require('../mongo-connector');
const competitionLoader = require('../competition-loader');
const pubsub = require('./pubsub');
const wcaApi = require('../utils/wca-api');
const { roundById } = require('../utils/wcif');
const { updateResult, openRound, clearRound, quitCompetitor } = require('../utils/results');
const { managerWcaUserIds, synchronize } = require('../utils/competition');

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { id }, context) => {
      const { user } = context;
      const wcif = await wcaApi(user).getWcif(id);
      const { value: competition } = await db.competitions.findOneAndUpdate(
        { 'wcif.id': id },
        { $setOnInsert: {
          wcif,
          managerWcaUserIds: managerWcaUserIds(wcif),
          synchronizedAt: new Date(),
        } },
        { upsert: true, returnOriginal: false },
      );
      context.competition = competition;
      return competition;
    }
  ),
  setResult: withCompetitionAuthorization(
    async (parent, { competitionId, roundId, result }, context) => {
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
      const { user } = context;
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedCompetition = await synchronize(competition, user);
        context.competition = await competitionLoader.update(updatedCompetition);
        return context.competition;
      });
    }
  ),
};
