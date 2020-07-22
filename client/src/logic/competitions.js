import { parseISO, differenceInMinutes } from 'date-fns';
import { uniq } from './utils';

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

export function competitionCountryIso2s(competition) {
  const iso2s = competition.venues.map((venue) => venue.country.iso2);
  return uniq(iso2s);
}
