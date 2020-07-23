export const parseActivityCode = (activityCode) => {
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

// export const eventRoundForActivityCode = (wcif, activityCode) => {
//   const { eventId, roundNumber } = parseActivityCode(activityCode);
//   const event = wcif.events.find((event) => event.id === eventId);
//   if (!event) return null;
//   const roundId = `${eventId}-r${roundNumber}`;
//   const round = event.rounds.find((round) => round.id === roundId);
//   if (!round) return null;
//   return { event, round };
// };

// TODO: tmp (at least move to competitions.js but dunno if that's the good approach)

export const eventRoundForActivityCode = (competitionEvents, activityCode) => {
  const { eventId, roundNumber } = parseActivityCode(activityCode);
  const competitionEvent = competitionEvents.find(
    ({ event }) => event.id === eventId
  );
  if (!competitionEvent) return null;
  const round = competitionEvent.rounds.find(
    (round) => round.number === roundNumber
  );
  if (!round) return null;
  return { event: competitionEvent.event, round };
};
