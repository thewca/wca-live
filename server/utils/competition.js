const { formatById } = require('./formats');

const processWcif = wcif => {
  wcif.events.forEach(event => {
    const [firstRound] = event.rounds;
    if (firstRound.results.length > 0) return;
    const registeredPeople = wcif.persons.filter(({ registration }) =>
      registration && registration.status === 'accepted' && registration.eventIds.includes(event.id)
    );
    const format = formatById(firstRound.format);
    firstRound.results = registeredPeople.map(person => ({
      personId: person.registrantId,
      ranking: null,
      attempts: Array.from({ length: format.solveCount }, () => ({ result: 0 })),
      advancable: false,
    }));
  });
};

module.exports = {
  processWcif,
};
