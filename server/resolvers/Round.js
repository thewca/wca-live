const { formatById } = require('../utils/formats');

module.exports = {
  format: ({ format }) => formatById(format),
};
