const bcrypt = require('bcrypt');
const { withCompetition, withCompetitionAuthorization } = require('./middleware');
const competitionLoader = require('../competition-loader');
const pubsub = require('./pubsub');
const { roundById } = require('../utils/wcif');
const { updateResult } = require('../utils/results');
const { openRound, clearRound, quitCompetitor, addCompetitor } = require('../utils/rounds');
const { importCompetition, synchronize, updateAccessSettings } = require('../utils/competition');

module.exports = {
  importCompetition: async (parent, { id }, context) => {
    if (!context.user) throw new AuthenticationError('Not authorized.');
    context.competition = await importCompetition(id, context.user);
    return context.competition;
  },
  synchronize: withCompetitionAuthorization(
    'scoretaker',
    async (parent, { competitionId }, context) => {
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedCompetition = await synchronize(competition);
        context.competition = await competitionLoader.update(updatedCompetition);
        return context.competition;
      });
    }
  ),
  updateAccessSettings: withCompetitionAuthorization(
    'manager',
    async (parent, { competitionId, accessSettings }, context) => {
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedCompetition = await updateAccessSettings(competition, accessSettings);
        context.competition = await competitionLoader.update(updatedCompetition);
        return context.competition;
      });
    }
  ),
  signIn: withCompetition(
    async (parent, { competitionId, password }, { competition, session }) => {
      const authenticated = await bcrypt.compare(password, competition.encryptedPassword);
      if (authenticated) {
        session.competitionId = competition._id;
        session.encryptedPassword = competition.encryptedPassword;
      }
      return authenticated;
    }
  ),
  updateResult: withCompetitionAuthorization(
    'scoretaker',
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
    'scoretaker',
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
    'scoretaker',
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
    'scoretaker',
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
  addCompetitor: withCompetitionAuthorization(
    'scoretaker',
    async (parent, { competitionId, roundId, competitorId }, context) => {
      return await competitionLoader.executeTask(competitionId, async () => {
        const competition = await competitionLoader.get(competitionId);
        const updatedWcif = addCompetitor(competition.wcif, roundId, parseInt(competitorId, 10));
        context.competition = await competitionLoader.update(
          { ...competition, wcif: updatedWcif },
          { resultsOnly: true }
        );
        return roundById(updatedWcif, roundId);
      });
    }
  ),
};
