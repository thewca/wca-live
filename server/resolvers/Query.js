const { withAuthentication, withCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { db } = require('../mongo-connector');
const { roundById, personById, startDate, endDate } = require('../utils/wcif');
const { dateToString } = require('../utils/date');

module.exports = {
  me: async (parent, args, { session }) => {
    return await db.users.findOne({ _id: new ObjectId(session.userId) });
  },
  competition: withCompetition(
    (parent, args, { competition }) => competition
  ),
  round: withCompetition(
    (parent, { roundId }, { competition }) => {
      return roundById(competition.wcif, roundId);
    }
  ),
  competitor: withCompetition(
    (parent, { competitorId }, { competition }) => {
      return personById(competition.wcif, parseInt(competitorId, 10));
    }
  ),
  competitions: async (parent, args) => {
    const today = dateToString(new Date());
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
