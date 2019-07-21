const { countryByIso2 } = require('../utils/countries');
const { flatMap } = require('../utils/utils');

module.exports = {
  id: ({ registrantId }) => registrantId,
  country: ({ countryIso2 }) => countryByIso2(countryIso2),
  results: ({ registrantId }, args, { competition }) => {
    return flatMap(competition.wcif.events, event =>
      flatMap(event.rounds, round =>
        round.results
          .filter(({ personId }) => personId === registrantId)
          .filter(({ attempts }) => attempts.some(({ result }) => result !== 0))
          .map(result => ({ ...result, round }))
      )
    );
  },
};
