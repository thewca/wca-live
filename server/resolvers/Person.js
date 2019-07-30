const { countryByIso2 } = require('../utils/countries');
const { flatMap } = require('../utils/utils');
const { sortWcifEvents } = require('../utils/events');
const { withAdvancable } = require('../utils/results');

module.exports = {
  id: ({ registrantId }) => registrantId,
  country: ({ countryIso2 }) => countryByIso2(countryIso2),
  results: ({ registrantId }, args, { competition }) => {
    const events = sortWcifEvents(competition.wcif.events);
    return flatMap(events, event =>
      flatMap(event.rounds, round =>
        /* TODO: store advancable in the database again as cache (?)
                 or compute only for the necessary ruonds here. */
        withAdvancable(round.results, round, competition.wcif)
          .filter(({ personId }) => personId === registrantId)
          .filter(({ attempts }) => attempts.length > 0)
          .map(result => ({ ...result, round }))
      )
    );
  },
};
