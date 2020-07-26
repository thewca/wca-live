import { parseISO, differenceInMinutes } from 'date-fns';
import { uniq } from './utils';
import { parseActivityCode } from './activity-code';

export function isPast(competition) {
  const competitionEnd = parseISO(competition.endTime);
  return differenceInMinutes(new Date(), competitionEnd) > 60;
}

export function isUpcoming(competition) {
  const competitionStart = parseISO(competition.startTime);
  return differenceInMinutes(competitionStart, new Date()) > 60;
}

export function isInProgress(competition) {
  return !isPast(competition) && !isUpcoming(competition);
}

export function competitionCountries(competition) {
  const countries = competition.venues.map((venue) => venue.country);
  const iso2s = uniq(countries.map((country) => country.iso2));
  return iso2s.map((iso2) =>
    countries.find((country) => country.iso2 === iso2)
  );
}

export function eventRoundForActivityCode(competitionEvents, activityCode) {
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
}
