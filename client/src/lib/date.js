import { closestIndexTo, parseISO, startOfToday, format } from 'date-fns';

export const formatDateRange = (startString, endString) => {
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
};

export const shortLocalTime = (isoString) => {
  return format(parseISO(isoString), 'HH:mm');
};

export const shortDate = (dateString) => {
  return format(parseISO(dateString), 'EEEE, MMM d');
};

export const toLocalDateString = (isoString) => {
  return format(parseISO(isoString), 'yyyy-MM-dd');
};

/**
 * Returns date string closest the current day.
 */
export const closestDateString = (dateStrings) => {
  const closestIndex = closestIndexTo(
    startOfToday(),
    dateStrings.map(parseISO)
  );
  return dateStrings[closestIndex];
};
