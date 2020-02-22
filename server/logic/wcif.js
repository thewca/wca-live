const { uniq, flatMap } = require('./utils');
const { addDays } = require('../logic/date');

const parseActivityCode = activityCode => {
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
};

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

const updateRound = (wcif, updatedRound) => {
  const { eventId } = parseActivityCode(updatedRound.id);
  return {
    ...wcif,
    events: wcif.events.map(event =>
      event.id !== eventId
        ? event
        : {
            ...event,
            rounds: event.rounds.map(round =>
              round.id === updatedRound.id ? updatedRound : round
            ),
          }
    ),
  };
};

const updateEvent = (wcif, updatedEvent) => {
  return {
    ...wcif,
    events: wcif.events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    ),
  };
};

const competitionCountryIso2s = wcif => {
  return uniq(wcif.schedule.venues.map(({ countryIso2 }) => countryIso2));
};

const topLevelActivities = wcif => {
  const rooms = flatMap(wcif.schedule.venues, venue => venue.rooms);
  return flatMap(rooms, room => room.activities);
};

const firstActivityStartTime = wcif => {
  const startTimes = topLevelActivities(wcif)
    .map(activity => new Date(activity.startTime));
  return new Date(Math.min(...startTimes));
};

const lastActivityEndTime = wcif => {
  const endTimes = topLevelActivities(wcif)
    .map(activity => new Date(activity.endTime));
  return new Date(Math.max(...endTimes));
};

const definitelyInPast = wcif => {
  const { startDate, numberOfDays } = wcif.schedule;
  const now = new Date().getTime();
  const oneDayAfter = new Date(startDate).getTime() + (numberOfDays + 1) * 24 * 60 * 60 * 1000;
  return oneDayAfter < now;
};

const definitelyInFuture = wcif => {
  const { startDate } = wcif.schedule;
  const now = new Date().getTime();
  const oneDayBefore = new Date(startDate).getTime() - 24 * 60 * 60 * 1000;
  return oneDayBefore > now;
};

const isPast = wcif => {
  if (definitelyInPast(wcif)) return true;
  if (definitelyInFuture(wcif)) return false;
  const now = new Date().getTime();
  const oneHourAfterEnd = lastActivityEndTime(wcif).getTime() + 60 * 60 * 1000;
  return oneHourAfterEnd < now;
};

const isUpcoming = wcif => {
  if (definitelyInFuture(wcif)) return true;
  if (definitelyInPast(wcif)) return false;
  const now = new Date().getTime();
  const oneHourBeforeStart = firstActivityStartTime(wcif) - 60 * 60 * 1000;
  return now < oneHourBeforeStart;
};

const isInProgress = wcif => {
  return !isPast(wcif) && !isUpcoming(wcif);
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
  competitionCountryIso2s,
  isPast,
  isUpcoming,
  isInProgress,
};
