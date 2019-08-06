const { addDays } = require('../utils/date');

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

const acceptedPeople = wcif => {
  return wcif.persons.filter(
    ({ registration }) => registration && registration.status === 'accepted'
  );
}

const startDate = wcif => {
  return wcif.schedule.startDate;
};

const endDate = wcif => {
  return addDays(wcif.schedule.startDate, wcif.schedule.numberOfDays - 1);
};

const nextRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  const event = eventById(wcif, eventId);
  return event.rounds.find(
    ({ id }) => parseActivityCode(id).roundNumber === roundNumber + 1
  );
};

const previousRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  const event = eventById(wcif, eventId);
  return event.rounds.find(
    ({ id }) => parseActivityCode(id).roundNumber === roundNumber - 1
  );
};

// TODO: use mapIn (https://github.com/jonatanklosko/groupifier-next/blob/5671626a1d8289f97ce76dbc8c8bef156f8e8934/src/logic/activities.js#L84)
const updateRound = (wcif, updatedRound) => {
  const { eventId } = parseActivityCode(updatedRound.id);
  return {
    ...wcif,
    events: wcif.events.map(event => event.id !== eventId ? event : ({
      ...event,
      rounds: event.rounds.map(round => round.id === updatedRound.id ? updatedRound : round),
    })),
  };
};

const updateEvent = (wcif, updatedEvent) => {
  return {
    ...wcif,
    events: wcif.events.map(
      event => event.id === updatedEvent.id ? updatedEvent : event
    ),
  };
};

module.exports = {
  parseActivityCode,
  eventById,
  roundById,
  personById,
  acceptedPeople,
  startDate,
  endDate,
  nextRound,
  previousRound,
  updateEvent,
  updateRound,
};
