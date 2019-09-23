import { sortBy } from './utils';

export const formatDateRange = (startString, endString) => {
  const start = new Date(startString);
  const end = new Date(endString);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startString === endString) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const firstPart =
    startYear === endYear
      ? `${startMonth} ${startDay}`
      : `${startMonth} ${startDay}, ${startYear}`;

  const secondPart =
    startMonth === endMonth
      ? `${endDay}, ${endYear}`
      : `${endMonth} ${endDay}, ${endYear}`;

  return `${firstPart} - ${secondPart}`;
};

export const shortLocalTime = isoString => {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const shortDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC' /* Make sure we return the given date. */,
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  });
};

export const toLocalDateString = isoString => {
  const date = new Date(isoString);
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return utcDate.toISOString().slice(0, 10);
};

/**
 * Returns date string closest the current day.
 */
export const closestDateString = dateStrings => {
  /* Set time part to 0 for all dates. */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [closest] = sortBy(dateStrings, dateString =>
    Math.abs(new Date(`${dateString}T00:00:00.000`) - today)
  );
  return closest;
};
