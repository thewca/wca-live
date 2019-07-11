const { withAuthentication, withCompetition } = require('./middleware');
const { getWcif } = require('../utils/wca-api');
const { roundById } = require('../utils/wcif');
const { setRankings, sortResults, setAdvancable } = require('../utils/results');

const getDocument = ({ value }) => {
  if (!value) throw new Error('Document not found.');
  return value;
};

const processWcif = wcif => {
  const events = wcif.events.map(event => {
    const [firstRound, ...rounds] = event.rounds;
    if (firstRound.results.length > 0) return event;
    const registeredPeople = wcif.persons.filter(({ registration }) =>
      registration && registration.status === 'accepted' && registration.eventIds.includes(event.id)
    );
    const results = registeredPeople.map(person => ({
      personId: person.registrantId,
      ranking: null,
      // TODO: set different number of attempts depending on the format.
      attempts: Array.from({ length: 5 }, () => ({ result: 0 })),
      advancable: false,
    }));
    return { ...event, rounds: [{ ...firstRound, results }, ...rounds] };
  });
  return { ...wcif, events };
};

module.exports = {
  importCompetition: withAuthentication(
    async (parent, { id }, { user, mongo: { Competitions } }) => {
      const wcif = await getWcif(id, user.oauth.accessToken);
      const managerWcaUserIds = wcif.persons.filter(
        person => person.roles.some(role => ['delegate', 'organizer', 'staff-dataentry'].includes(role))
      ).map(person => person.wcaUserId);
      const competition = getDocument(
        await Competitions.findOneAndUpdate(
          { 'wcif.id': id },
          { $setOnInsert: { wcif: processWcif(wcif), managerWcaUserIds } },
          { upsert: true, returnOriginal: false },
        )
      );
      return competition.wcif;
    }
  ),
  setResult: withAuthentication(withCompetition( // TODO: authorize user-competition
    async (parent, { roundId, result }, { competition, mongo: { Competitions } }) => {
      const round = roundById(competition.wcif, roundId);
      const currentResult = round.results.find(
        ({ personId }) => personId === parseInt(result.personId, 10)
      );
      currentResult.attempts = result.attempts.map(attempt => ({ result: attempt }));
      setRankings(round.results, ['average', 'best']); // TODO: change second argument
      round.results = sortResults(round.results, competition.wcif);
      setAdvancable(round.results, round.advancementCondition); /* TODO: handle noshows */
      await Competitions.findOneAndUpdate(
        { 'wcif.id': competition.wcif.id },
        { $set: { wcif: competition.wcif } }
      );
      return round;
    }
  )),
};
