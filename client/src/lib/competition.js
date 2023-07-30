import { parseISO, differenceInMinutes } from "date-fns";
import { uniq, minBy } from "./utils";
import { parseActivityCode } from "./activity-code";
import { getLocationEstimate, distanceKm } from "./geolocation";

/**
 * Checks if the competition is past, that is whether
 * the last activity ended more than an hour ago.
 */
export function isPast(competition) {
  const competitionEnd = parseISO(competition.endTime);
  return differenceInMinutes(new Date(), competitionEnd) > 60;
}

/**
 * Checks if the competition is upcoming, that is whether
 * the first activity starts in less than an hour.
 */
export function isUpcoming(competition) {
  const competitionStart = parseISO(competition.startTime);
  return differenceInMinutes(competitionStart, new Date()) > 60;
}

/**
 * Checks if the competition is in progress.
 */
export function isInProgress(competition) {
  return !isPast(competition) && !isUpcoming(competition);
}

/**
 * Returns a list of unique countries where competition venues are located.
 */
export function competitionCountries(competition) {
  const countries = competition.venues.map((venue) => venue.country);
  const iso2s = uniq(countries.map((country) => country.iso2));
  return iso2s.map((iso2) =>
    countries.find((country) => country.iso2 === iso2)
  );
}

/**
 * Searches competition event list for the event and round corresponding to the given activity code.
 */
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

/**
 * Returns competition from the given list that is closest to the device location.
 */
export async function nearestCompetition(competitions) {
  const { latitude, longitude } = await getLocationEstimate();

  return minBy(competitions, (competition) => {
    const distances = competition.venues.map((venue) =>
      distanceKm(latitude, longitude, venue.latitude, venue.longitude)
    );
    return Math.min(...distances);
  });
}
