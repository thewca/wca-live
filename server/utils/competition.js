const { getWcif, updateWcif } = require ('./wca-api');

/* Gets current WCIF from the WCA website and override results with the local ones. */
const synchronize = async (wcif, accessToken) => {
  const newWcif = await getWcif(wcif.id, accessToken);
  newWcif.events.forEach(newEvent => {
    const event = wcif.events.find(event => event.id === newEvent.id);
    newEvent.rounds.forEach(newRound => {
      const round = event.rounds.find(round => round.id === newRound.id);
      newRound.results = round.results;
    });
  });
  await updateWcif(wcif.id, { events: newWcif.events }, accessToken);
  return newWcif;
};

module.exports = {
  synchronize,
};
