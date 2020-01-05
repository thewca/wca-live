const { formatById } = require('../logic/formats');
const { parseActivityCode, eventById, personById, nextRound, previousRound } = require('../logic/wcif');
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
  _id: ({ id, wcif }) => {
    return `${wcif.id}:${id}`;
  },
  format: ({ format }) => formatById(format),
  event: ({ id, wcif }) => {
    const { eventId } = parseActivityCode(id);
    const event = eventById(wcif, eventId);
    return withWcif(wcif)(event);
  },
  name: ({ id, wcif }) => {
    const { eventId, roundNumber } = parseActivityCode(id);
    const event = eventById(wcif, eventId);
    return friendlyRoundName(roundNumber, event.rounds.length);
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
      .map(withWcif(wcif));
  },
  missingQualifying: ({ id, wcif }) => {
    const { qualifyingIds, excessIds } = missingQualifyingIds(wcif, id);
    return {
      qualifying: qualifyingIds
        .map(personId => personById(wcif, personId))
        .map(withWcif(wcif)),
      excess: excessIds
        .map(personId => personById(wcif, personId))
        .map(withWcif(wcif)),
    };
  },
  previous: ({ id, wcif }) => {
    const previous = previousRound(wcif, id);
    return previous ? withWcif(wcif)(previous) : null;
  },
  next: ({ id, wcif }) => {
    const next = nextRound(wcif, id);
    return next ? withWcif(wcif)(next) : null;
  },
};
