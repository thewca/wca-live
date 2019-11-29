const { withAuthentication, requireCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const { roundById, personById, startDate, endDate } = require('../logic/wcif');
const { dateToUTCDateString } = require('../logic/date');
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
    const person = personById(competition.wcif, competitorId);
    return withWcif(competition.wcif)(person);
  },
  competitions: async (parent, args) => {
    const today = dateToUTCDateString(new Date());
    const competitions = await db.competitions
      .find({})
      /* Note: this projection means we won't resolve some GraphQL queries,
         but this is only expected to be used on the main competition page,
         and projection provides an enormous speed boost
         (as loading all results and people into the memory is slow). */
      .project({ 'wcif.persons': 0, 'wcif.events': 0 })
      .sort({
        'wcif.schedule.startDate': 1,
        'wcif.schedule.numberOfDays': 1,
        'wcif.shortName': 1,
      })
      .toArray();
    const upcoming = competitions.filter(({ wcif }) => startDate(wcif) > today);
    const inProgress = competitions.filter(
      ({ wcif }) => startDate(wcif) <= today && today <= endDate(wcif)
    );
    const past = competitions
      .filter(({ wcif }) => endDate(wcif) < today)
      .reverse();

    return { upcoming, inProgress, past };
  },
};
