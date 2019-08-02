const { withFilter } = require('apollo-server-express');
const pubsub = require('./pubsub');
const { withCompetition } = require('./middleware');

module.exports = {
  roundUpdate: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['ROUND_UPDATE']),
      // TODO: it's not the best place to use withCompetition
      withCompetition((payload, variables) => {
        return payload.competitionId === variables.competitionId
            && payload.roundId === variables.roundId;
      })
    ),
  },
};
