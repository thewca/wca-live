const { countryByIso2 } = require('../logic/countries');
const { flatMap } = require('../logic/utils');
const { advancingResults } = require('../logic/advancement');

module.exports = {
  id: ({ registrantId }) => registrantId,
  country: ({ countryIso2 }) => countryByIso2(countryIso2),
  results: ({ registrantId, wcif }) => {
    const rounds = flatMap(wcif.events, event => event.rounds);
    const roundsWhereHasResult = rounds.filter(round =>
      round.results.some(
        ({ personId, attempts }) =>
          personId === registrantId && attempts.length > 0
      )
    );
    return roundsWhereHasResult.map(round => {
      const advancing = advancingResults(round, wcif);
      const result = round.results.find(
        ({ personId }) => personId === registrantId
      );
      return {
        ...result,
        round,
        advancable: advancing.includes(result),
      };
    });
  },
};
