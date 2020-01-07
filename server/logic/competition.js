const bcrypt = require('bcrypt');
const { db } = require('../mongo-connector');
const wcaApi = require('./wca-api');
const { personById, eventById } = require('./wcif');
const { uniq, haveSameElements, diff } = require('./utils');
const { addCompetitor } = require('./rounds');

const managerWcaUserIds = wcif => {
  return wcif.persons
    .filter(
      ({ roles }) => roles.includes('delegate') || roles.includes('organizer')
    )
    .map(person => person.wcaUserId);
};

const scoretakerWcaUserIds = wcif => {
  return wcif.persons
    .filter(({ roles }) => roles.includes('staff-dataentry'))
    .map(person => person.wcaUserId);
};

const importedByUser = async competition => {
  /* Use oauth credentials of whoever imported the competition to do synchronization,
     because plain scoretakers don't have permissions to save WCIF to the WCA website,
     yet we still want them to be able to synchronize results. */
  return await db.users.findOne({ _id: competition.importedById });
};

const importCompetition = async (competitionId, user) => {
  const wcif = await wcaApi(user).getWcif(competitionId);
  const { value: competition } = await db.competitions.findOneAndUpdate(
    { 'wcif.id': competitionId },
    {
      $setOnInsert: {
        wcif,
        importedById: user._id,
        synchronizedAt: new Date(),
        managerWcaUserIds: managerWcaUserIds(wcif),
        scoretakerWcaUserIds: scoretakerWcaUserIds(wcif),
        encryptedPassword: null,
      },
    },
    { upsert: true, returnOriginal: false }
  );
  return competition;
};

const synchronizeWcif = (oldWcif, newWcif) => {
  /* Use new events data, but keep all current results. */
  const events = newWcif.events.map(newEvent => {
    const oldEvent = eventById(oldWcif, newEvent.id);
    if (!oldEvent) return newEvent;
    const rounds = newEvent.rounds.map(newRound => {
      const oldRound = oldEvent.rounds.find(round => round.id === newRound.id);
      if (!oldRound) return newRound;
      return { ...newRound, results: oldRound.results };
    });
    return { ...newEvent, rounds };
  });
  const wcifWithUpdatedEvents = { ...newWcif, events };
  /* Make empty rounds reflect new registration events. */
  const wcifWithUpdatedRegistrationEvents = newWcif.persons.reduce((wcif, newPerson) => {
    if (!newPerson.registration || newPerson.registration.status !== 'accepted') return wcif;
    const oldPerson = personById(oldWcif, newPerson.registrantId);
    const addedEventIds = oldPerson
      ? diff(newPerson.registration.eventIds, oldPerson.registration.eventIds)
      : newPerson.registration.eventIds;
    return addedEventIds.reduce((wcif, eventId) => {
      const event = eventById(wcif, eventId);
      const [firstRound, secondRound] = event.rounds;
      /* Ignore new registration event if the first round is not open yet or it's already closed. */
      if (
        firstRound.results.length === 0 ||
        (secondRound && secondRound.results.length > 0)
      ) {
        return wcif;
      }
      return addCompetitor(wcif, firstRound.id, newPerson.registrantId, false);
    }, wcif);
  }, wcifWithUpdatedEvents);

  return wcifWithUpdatedRegistrationEvents;
};

/* Gets current WCIF from the WCA website, combines it with the local WCIF
   and saves it back to the WCA website.
   Returns the synchronized competition. */
const synchronize = async competition => {
  const user = await importedByUser(competition);
  const newWcif = await wcaApi(user).getWcif(competition.wcif.id);
  const updatedWcif = synchronizeWcif(competition.wcif, newWcif);
  await wcaApi(user).updateWcif(updatedWcif.id, {
    /* WCA Live modifies results only, so that's all we need to save back. */
    events: updatedWcif.events,
  });
  return {
    ...competition,
    wcif: updatedWcif,
    managerWcaUserIds: managerWcaUserIds(updatedWcif),
    scoretakerWcaUserIds: scoretakerWcaUserIds(updatedWcif),
    synchronizedAt: new Date(),
  };
};

const updateAccessSettings = async (competition, accessSettings) => {
  const { scoretakerIds, passwordAuthEnabled, password } = accessSettings;
  const scoretakerWcaUserIds = scoretakerIds.map(
    id => personById(competition.wcif, id).wcaUserId
  );
  const persons = competition.wcif.persons.map(person => ({
    ...person,
    roles: scoretakerIds.includes(person.registrantId)
      ? uniq([...person.roles, 'staff-dataentry'])
      : person.roles.filter(role => role !== 'staff-dataentry'),
  }));
  const encryptedPassword = passwordAuthEnabled
    ? password
      ? await bcrypt.hash(password, 12)
      : competition.encryptedPassword
    : null;
  if (
    !haveSameElements(scoretakerWcaUserIds, competition.scoretakerWcaUserIds)
  ) {
    const user = await importedByUser(competition);
    /* Save scoretakers change straightaway, so during synchronization we can
       always overried local scoretakers with the synchronized ones. */
    await wcaApi(user).updateWcif(competition.wcif.id, { persons });
  }
  return {
    ...competition,
    wcif: { ...competition.wcif, persons },
    scoretakerWcaUserIds,
    encryptedPassword,
  };
};

const hasAccess = (role, competition, user, session) => {
  const authorizedManagerWcaUserIds = [
    ...competition.managerWcaUserIds,
    6008 /* Jonatan Kłosko */,
  ];
  const authorizedScoretakerWcaUserIds = [
    ...authorizedManagerWcaUserIds,
    ...competition.scoretakerWcaUserIds,
  ];
  if (role === 'manager') {
    return !!user && authorizedManagerWcaUserIds.includes(user.wcaUserId);
  } else if (role === 'scoretaker') {
    const passwordSession =
      session.competitionId === competition._id.toString() &&
      session.encryptedPassword === competition.encryptedPassword;
    return (
      passwordSession ||
      (!!user && authorizedScoretakerWcaUserIds.includes(user.wcaUserId))
    );
  } else {
    throw new Error(`Unrecognised role: ${role}`);
  }
  return false;
};

module.exports = {
  importCompetition,
  synchronizeWcif,
  synchronize,
  updateAccessSettings,
  hasAccess,
};
