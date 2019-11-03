const { withAuthentication, requireCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const { roundById, personById, startDate, endDate } = require('../utils/wcif');
const { dateToUTCDateString } = require('../utils/date');
const { withWcif } = require('./utils');

module.exports = {
  me: async (parent, args, { session }) => {
    return await db.users.findOne({ _id: new ObjectId(session.userId) });
  },
  competition: async (parent, { id }) => {
    return await requireCompetition(id);
  },
  round: async (parent, { competitionId, roundId }) => {
    const competition = await requireCompetition(competitionId);
    const round = roundById(competition.wcif, roundId);
    return withWcif(competition.wcif)(round);
  },
  competitor: async (parent, { competitionId, competitorId }) => {
    const competition = await requireCompetition(competitionId);
    const person = personById(competition.wcif, parseInt(competitorId, 10));
    return withWcif(competition.wcif)(person);
  },
  competitions: async (parent, args) => {
    const today = dateToUTCDateString(new Date());
    const competitions = await db.competitions
      .find({})
      .sort({ 'wcif.schedule.startDate': 1, 'wcif.schedule.numberOfDays': 1, 'wcif.shortName': 1 })
      .toArray();
    const upcoming = competitions.filter(
      ({ wcif }) => startDate(wcif) > today
    );
    const inProgress = competitions.filter(
      ({ wcif }) => startDate(wcif) <= today && today <= endDate(wcif)
    );
    const past = competitions.filter(
      ({ wcif }) => endDate(wcif) < today
    ).reverse();

    return { upcoming, inProgress, past };
  },
};
