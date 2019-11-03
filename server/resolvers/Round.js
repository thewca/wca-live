const { formatById } = require('../logic/formats');
const { parseActivityCode, eventById, personById } = require('../logic/wcif');
const {
  friendlyRoundName,
  roundLabel,
  roundFinished,
  roundActive,
} = require('../logic/rounds');
const {
  advancingResults,
  nextQualifyingToRound,
  missingQualifyingIds,
} = require('../logic/advancement');
const { withWcif } = require('./utils');

module.exports = {
  format: ({ format }) => formatById(format),
  event: ({ id, wcif }) => {
    const { eventId } = parseActivityCode(id);
    const event = eventById(wcif, eventId);
    return withWcif(wcif)(event);
  },
  name: ({ id, cutoff, wcif }) => {
    const { eventId, roundNumber } = parseActivityCode(id);
    const event = eventById(wcif, eventId);
    return friendlyRoundName(roundNumber, event.rounds.length, cutoff);
  },
  label: round => {
    return roundLabel(round);
  },
  results: parent => {
    const advancing = advancingResults(parent, parent.wcif);
    return parent.results
      .map(result => ({
        ...result,
        round: parent,
        advancable: advancing.includes(result),
      }))
      .map(withWcif(parent.wcif));
  },
  open: ({ results }) => results.length > 0,
  finished: round => {
    return roundFinished(round);
  },
  active: round => {
    return roundActive(round);
  },
  nextQualifying: ({ id, wcif }) => {
    return nextQualifyingToRound(wcif, id)
      .map(personId => personById(wcif, personId))
      .map(withWcif(parent.wcif));
  },
  missingQualifying: ({ id, wcif }) => {
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, id);
    return {
      qualifying: qualifyingIds
        .map(personId => personById(wcif, personId))
        .map(withWcif(parent.wcif)),
      excess: excessIds
        .map(personId => personById(wcif, personId))
        .map(withWcif(parent.wcif)),
    };
  },
};
