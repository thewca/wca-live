const dateToUTCDateString = date => {
  return date.toISOString().slice(0, 10);
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return dateToUTCDateString(date);
};

module.exports = {
  dateToUTCDateString,
  addDays,
};
