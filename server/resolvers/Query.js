const { withAuthentication } = require('./middleware');
const { ObjectId } = require('mongodb');
const { parseActivityCode } = require('../utils/wcif');

module.exports = {
  me: async (parent, args, { session, mongo: { Users } }) => {
    return await Users.findOne({ _id: new ObjectId(session.userId) });
  },
  competition: async (parent, { id }, { mongo: { Competitions } }) => {
    const competition = await Competitions.findOne({ 'wcif.id': id });
    return competition.wcif;
  },
  round: async (parent, { competitionId, roundId }, { mongo: { Competitions } }) => {
    const { eventId } = parseActivityCode(roundId);
    const competition = await Competitions.findOne({ 'wcif.id': competitionId });
    const event = competition.wcif.events.find(event => event.id === eventId);
    const round = event.rounds.find(round => round.id === roundId);
    return round;
  },
};
