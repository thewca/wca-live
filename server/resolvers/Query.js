const { withAuthentication, withCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { roundById, personById, startDate, endDate } = require('../utils/wcif');
const { dateToString } = require('../utils/date');
const { nextAdvancableToRound } = require('../utils/results');

module.exports = {
  me: async (parent, args, { session, mongo: { Users } }) => {
    return await Users.findOne({ _id: new ObjectId(session.userId) });
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
  competitions: async (parent, args, { mongo: { Competitions } }) => {
    const today = dateToString(new Date());
    const competitions = await Competitions
      .find({})
      .sort({ 'wcif.schedule.startDate': 1, 'wcif.schedule.numberOfDays': 1 })
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
  nextAdvancable: withCompetition(
    (parent, { roundId }, { competition }) => {
      return nextAdvancableToRound(competition.wcif, roundId).map(
        personId => personById(competition.wcif, personId)
      );
    }
  ),
};
