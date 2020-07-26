import { closestIndexTo, parseISO, startOfToday, format } from 'date-fns';

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
  return `${shortLocalTime(startString)} - ${shortLocalTime(endString)}`;
}

export function shortLocalTime(isoString) {
  return format(parseISO(isoString), 'HH:mm');
}

export function shortDate(dateString) {
  return format(parseISO(dateString), 'EEEE, MMM d');
}

export function toLocalDateString(isoString) {
  return format(parseISO(isoString), 'yyyy-MM-dd');
}

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
