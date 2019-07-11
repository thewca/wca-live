const { countryByIso2 } = require('../utils/countries');

module.exports = {
  id: ({ registrantId }) => registrantId,
  country: ({ countryIso2 }) => countryByIso2(countryIso2),
};
