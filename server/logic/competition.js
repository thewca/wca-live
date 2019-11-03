const bcrypt = require('bcrypt');
const { db } = require('../mongo-connector');
const wcaApi = require ('./wca-api');
const { personById } = require('../logic/wcif');
const { uniq, haveSameElements } = require('../logic/utils');

const managerWcaUserIds = wcif => {
  return wcif.persons
    .filter(({ roles }) =>
      roles.includes('delegate') || roles.includes('organizer')
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
    { upsert: true, returnOriginal: false },
  );
  return competition;
};

/* Gets current WCIF from the WCA website and overrides results with the local ones.
   Returns synchronized competition. */
const synchronize = async (competition) => {
  const user = await importedByUser(competition);
  const newWcif = await wcaApi(user).getWcif(competition.wcif.id);
  newWcif.events.forEach(newEvent => {
    const event = competition.wcif.events.find(event => event.id === newEvent.id);
    if (event) {
      newEvent.rounds.forEach(newRound => {
        const round = event.rounds.find(round => round.id === newRound.id);
        if (round) {
          newRound.results = round.results;
        }
      });
    }
  });
  await wcaApi(user).updateWcif(competition.wcif.id, { events: newWcif.events });
  return {
    ...competition,
    wcif: newWcif,
    managerWcaUserIds: managerWcaUserIds(newWcif),
    scoretakerWcaUserIds: scoretakerWcaUserIds(newWcif),
    synchronizedAt: new Date(),
  };
};

const updateAccessSettings = async (competition, accessSettings) => {
  const scoretakerIds = accessSettings.scoretakerIds.map(id => parseInt(id, 10));
  const scoretakerWcaUserIds = scoretakerIds
    .map(id => personById(competition.wcif, id).wcaUserId);
  const persons = competition.wcif.persons.map(person => ({
    ...person,
    roles: scoretakerIds.includes(person.registrantId)
      ? uniq([...person.roles, 'staff-dataentry'])
      : person.roles.filter(role => role !== 'staff-dataentry')
  }));
  const { passwordAuthEnabled, password } = accessSettings;
  const encryptedPassword = passwordAuthEnabled
    ? (password ? await bcrypt.hash(password, 12) : competition.encryptedPassword)
    : null;
  if (!haveSameElements(scoretakerWcaUserIds, competition.scoretakerWcaUserIds)) {
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
    6008, /* Jonatan Kłosko */
  ];
  const authorizedScoretakerWcaUserIds = [
    ...authorizedManagerWcaUserIds,
    ...competition.scoretakerWcaUserIds,
  ];
  if (role === 'manager') {
    return !!user && authorizedManagerWcaUserIds.includes(user.wcaUserId);
  } else if (role === 'scoretaker') {
    const passwordSession =
      session.competitionId === competition._id.toString()
      && session.encryptedPassword === competition.encryptedPassword;
    return passwordSession || (!!user && authorizedScoretakerWcaUserIds.includes(user.wcaUserId));
  } else {
    throw new Error(`Unrecognised role: ${role}`)
  }
  return false;
};

module.exports = {
  importCompetition,
  synchronize,
  updateAccessSettings,
  hasAccess,
};
