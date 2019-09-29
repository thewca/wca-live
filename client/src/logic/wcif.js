export const parseActivityCode = activityCode => {
  const [, e, r, g, a] = activityCode.match(
    /(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/
  );
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10),
  };
};

export const eventRoundForActivityCode = (wcif, activityCode) => {
  const { eventId, roundNumber } = parseActivityCode(activityCode);
  const event = wcif.events.find(event => event.id === eventId);
  if (!event) return null;
  const roundId = `${eventId}-r${roundNumber}`;
  const round = event.rounds.find(round => round.id === roundId);
  if (!round) return null;
  return { event, round };
};
