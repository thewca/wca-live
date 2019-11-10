const { withWcif } = require('./utils');

module.exports = {
  event: ({ event, competition }) => {
    return withWcif(competition.wcif)(event);
  },
  round: ({ round, competition }) => {
    return withWcif(competition.wcif)(round);
  },
  result: ({ result, round, competition }) => {
    return withWcif(competition.wcif)({ ...result, round });
  },
};
