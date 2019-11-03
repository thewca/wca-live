const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const competitionLoader = require('../competition-loader');
const { hasAccess } = require('../logic/competition');

const requireCompetition = async (id) => {
  const competition = await competitionLoader.get(id);
  if (!competition) {
    throw new Error('Competition not found.');
  }
  return competition;
};

const requireCompetitionWithAuthorization = async (competitionId, role, user, session) => {
  const competition = await requireCompetition(competitionId);
  if (!hasAccess(role, competition, user, session)) {
    throw new AuthenticationError('Not authorized.');
  }
  return competition;
};

module.exports = {
  requireCompetition,
  requireCompetitionWithAuthorization,
};
