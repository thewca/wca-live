const wcaApi = require ('./wca-api');

const managerWcaUserIds = wcif => {
  return wcif.persons
    .filter(person =>
      person.roles.some(
        role => ['delegate', 'organizer', 'staff-dataentry'].includes(role)
      )
    )
    .map(person => person.wcaUserId);
};

/* Gets current WCIF from the WCA website and overrides results with the local ones. */
const synchronize = async (competition, user) => {
  const newWcif = await wcaApi(user).getWcif(competition.wcif.id);
  newWcif.events.forEach(newEvent => {
    const event = competition.wcif.events.find(event => event.id === newEvent.id);
    newEvent.rounds.forEach(newRound => {
      const round = event.rounds.find(round => round.id === newRound.id);
      newRound.results = round.results;
    });
  });
  await wcaApi(user).updateWcif(competition.wcif.id, { events: newWcif.events });
  return {
    ...competition,
    wcif: newWcif,
    managerWcaUserIds: managerWcaUserIds(newWcif),
    synchronizedAt: new Date(),
  };
};

module.exports = {
  managerWcaUserIds,
  synchronize,
};
