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

export const shortLocalTime = isoString =>
  new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  });

export const shortLocalDate = isoString =>
  new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  });

export const toDateString = isoString => {
  const date = new Date(isoString);
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return utcDate.toISOString().slice(0, 10);
};
