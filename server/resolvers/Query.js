const { withAuthentication, withCompetition } = require('./middleware');
const { ObjectId } = require('mongodb');
const { roundById, personById } = require('../utils/wcif');
const { dateToString, addDays } = require('../utils/date');

module.exports = {
  me: async (parent, args, { session, mongo: { Users } }) => {
    return await Users.findOne({ _id: new ObjectId(session.userId) });
  },
  competition: withCompetition(
    async (parent, args, { competition }) => {
      return competition;
    }
  ),
  round: withCompetition(
    async (parent, { roundId }, { competition }) => {
      return roundById(competition.wcif, roundId);
    }
  ),
  competitor: withCompetition(
    async (parent, { competitorId }, { competition }) => {
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
      ({ wcif }) => wcif.schedule.startDate > today
    );
    const inProgress = competitions.filter(
      ({ wcif }) => wcif.schedule.startDate <= today && today <= addDays(wcif.schedule.startDate, wcif.schedule.numberOfDays - 1)
    );
    const past = competitions.filter(
      ({ wcif }) => addDays(wcif.schedule.startDate, wcif.schedule.numberOfDays - 1) < today
    ).reverse();
    return {
      upcoming,
      inProgress,
      past,
    };
  },
};
