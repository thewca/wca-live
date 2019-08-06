const { withFilter } = require('apollo-server-express');
const pubsub = require('./pubsub');
const { withCompetition } = require('./middleware');

module.exports = {
  roundUpdate: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['ROUND_UPDATE']),
      (payload, variables) => {
        return payload.competitionId === variables.competitionId
            && payload.roundId === variables.roundId;
      }
    ),
    resolve: withCompetition(({ roundUpdate }) => {
      return roundUpdate;
    }),
  },
};
