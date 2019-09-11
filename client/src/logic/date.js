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
