const bcrypt = require('bcrypt');
const { AuthenticationError } = require('apollo-server-express');
const { requireCompetition, requireRole } = require('./middleware');
const competitionLoader = require('../competition-loader');
const pubsub = require('./pubsub');
const { roundById } = require('../logic/wcif');
const { updateResult } = require('../logic/results');
const {
  openRound,
  clearRound,
  quitCompetitor,
  addCompetitor,
} = require('../logic/rounds');
const {
  importCompetition,
  synchronize,
  updateAccessSettings,
} = require('../logic/competition');
const { withWcif } = require('./utils');

module.exports = {
  signOut: async (parent, args, { session }) => {
    session.destroy();
    return true;
  },
  importCompetition: async (parent, { id }, context) => {
    if (!context.user) throw new AuthenticationError('Not authorized.');
    return await importCompetition(id, context.user);
  },
  synchronize: async (parent, { competitionId }, { user, session }) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedCompetition = await synchronize(competition);
      return await competitionLoader.update(updatedCompetition);
    });
  },
  updateAccessSettings: async (
    parent,
    { competitionId, accessSettings },
    { user, session }
  ) => {
    await requireRole('manager', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedCompetition = await updateAccessSettings(
        competition,
        accessSettings
      );
      return await competitionLoader.update(updatedCompetition);
    });
  },
  signIn: async (parent, { competitionId, password }, { session }) => {
    const competition = await requireCompetition(competitionId);
    if (competition.encryptedPassword === null) {
      throw new Error(`The competition doesn't use password authentication.`);
    }
    const authenticated = await bcrypt.compare(
      password,
      competition.encryptedPassword
    );
    if (authenticated) {
      session.competitionId = competition._id;
      session.encryptedPassword = competition.encryptedPassword;
    }
    return authenticated;
  },
  updateResult: async (
    parent,
    { competitionId, roundId, result },
    { user, session }
  ) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const attempts = result.attempts.map(attempt => ({ result: attempt }));
      const personId = result.personId;
      const updatedWcif = updateResult(
        competition.wcif,
        roundId,
        personId,
        attempts
      );
      const updatedRound = roundById(updatedWcif, roundId);
      const updatedRoundWithWcif = withWcif(updatedWcif)(updatedRound);
      pubsub.publish('ROUND_UPDATE', {
        roundUpdate: updatedRoundWithWcif,
        competitionId,
        roundId,
      });
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return updatedRoundWithWcif;
    });
  },
  openRound: async (parent, { competitionId, roundId }, { user, session }) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = openRound(competition.wcif, roundId);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  clearRound: async (parent, { competitionId, roundId }, { user, session }) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = clearRound(competition.wcif, roundId);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  quitCompetitor: async (
    parent,
    { competitionId, roundId, competitorId, replace },
    { user, session }
  ) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = quitCompetitor(competition.wcif, roundId, competitorId, replace);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  addCompetitor: async (
    parent,
    { competitionId, roundId, competitorId },
    { user, session }
  ) => {
    await requireRole('scoretaker', competitionId, user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = addCompetitor(competition.wcif, roundId, competitorId);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
};
