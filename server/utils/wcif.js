const parseActivityCode = activityCode => {
  const [, e, r, g, a] = activityCode.match(/(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/);
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10)
  };
};

const roundById = (wcif, roundId) => {
  const { eventId } = parseActivityCode(roundId);
  const event = wcif.events.find(event => event.id === eventId);
  return event.rounds.find(round => round.id === roundId);
};

module.exports = {
  parseActivityCode,
  roundById,
};
