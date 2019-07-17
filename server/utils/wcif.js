const parseActivityCode = activityCode => {
  const [, e, r, g, a] = activityCode.match(/(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/);
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10)
  };
};

const eventById = (wcif, eventId) => {
  return wcif.events.find(event => event.id === eventId);
};

const roundById = (wcif, roundId) => {
  const { eventId } = parseActivityCode(roundId);
  return eventById(wcif, eventId).rounds.find(round => round.id === roundId);
};

const personById = (wcif, personId) => {
  return wcif.persons.find(person => person.registrantId === personId);
};

module.exports = {
  parseActivityCode,
  eventById,
  roundById,
  personById,
};
