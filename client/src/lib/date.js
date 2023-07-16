import {
  closestIndexTo,
  parseISO,
  startOfToday,
  format,
  sub,
  formatISO,
} from 'date-fns';

export function formatDateRange(startString, endString) {
  const [startDay, startMonth, startYear] = format(
    parseISO(startString),
    'd MMM yyyy'
  ).split(' ');
  const [endDay, endMonth, endYear] = format(
    parseISO(endString),
    'd MMM yyyy'
  ).split(' ');

  if (startString === endString) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }
  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

export function formatTimeRange(startString, endString) {
  return `${formatTimeShort(startString)} - ${formatTimeShort(endString)}`;
}

export function formatTimeShort(isoString) {
  return format(parseISO(isoString), 'HH:mm');
}

export function formatDateShort(dateString) {
  return format(parseISO(dateString), 'EEEE, MMM d');
}

/**
 * Returns a date string representing the local date corresponding to the given ISO date.
 */
export function toLocalDateString(isoString) {
  return format(parseISO(isoString), 'yyyy-MM-dd');
}

/**
 * Returns system timezone.
 */
export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Returns date string closest the current day.
 */
export function closestDateString(dateStrings) {
  const closestIndex = closestIndexTo(
    startOfToday(),
    dateStrings.map(parseISO)
  );
  return dateStrings[closestIndex];
}

/**
 * Returns date string representing the day month ago.
 */
export function monthAgoDateString() {
  const monthAgo = sub(startOfToday(), { months: 1 });
  return formatISO(monthAgo, { representation: 'date' });
}

/**
 * Returns the current date time as ISO string.
 */
export function nowISOString() {
  return new Date().toISOString();
}
