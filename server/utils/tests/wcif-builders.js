const nextIdByBuilder = new Map();
const withId = builder => {
  nextIdByBuilder.set(builder, 1);
  return attributes => {
    const id = nextIdByBuilder.get(builder);
    nextIdByBuilder.set(builder, id + 1);
    return builder(id)(attributes);
  };
};

module.exports.Competition = attributes => ({
  formatVersion: '1.0',
  id: 'Example2019',
  name: 'Example Competition 2019',
  shortName: 'Example 2019',
  persons: [],
  events: [],
  extensions: [],
  ...attributes,
  schedule: {
    startDate: '2020-01-01',
    numberOfDays: 2,
    venues: [],
    ...attributes.schedule
  }
});

module.exports.Person = withId(id => attributes => ({
  name: `Person ${id}`,
  wcaUserId: id,
  wcaId: `2019PERS${id % 100}`,
  registrantId: id,
  countryIso2: 'GB',
  gender: 'm',
  birthdate: '2000-01-01',
  email: `person${id}@example.com`,
  avatar: {
    url: 'https://example.com/avatar.jpg',
    thumbUrl: 'https://example.com/avatar-thumb.jpg'
  },
  roles: [],
  assignments: [],
  personalBests: [],
  ...attributes,
  registration: {
    wcaRegistrationId: id,
    eventIds: [],
    status: 'accepted',
    guests: 0,
    comments: '',
    ...attributes.registration
  }
}));

module.exports.PersonalBest = attributes => {
  const { eventId, worldRanking, type } = attributes;
  if (!eventId || !worldRanking || !type) throw new Error('PersonalBest requires eventId, worldRanking and type.');
  return {
    best: worldRanking * 200,
    continentalRanking: worldRanking,
    nationalRanking: worldRanking,
    ...attributes
  };
};

module.exports.Event = attributes => ({
  id: '333',
  rounds: [],
  competitorLimit: null,
  qualification: null,
  extensions: [],
  ...attributes
});

module.exports.Round = attributes => ({
  id: '333-r1',
  format: 'a',
  timeLimit: { centiseconds: 10 * 60 * 60 * 10, cumulativeRoundIds: [] },
  cutoff: null,
  advancementCondition: { type: 'percent', level: 75 },
  results: [],
  scrambleSetCount: 1,
  scrambleSets: [],
  extensions: [],
  ...attributes
});

module.exports.Result = attributes => {
  const { personId, ranking } = attributes;
  if (!personId) throw new Error('Result requires personId.');
  const multiplier = ranking || 10;
  return {
    attempts: [
      { result: multiplier * 200 },
      { result: multiplier * 205 },
      { result: multiplier * 150 },
      { result: multiplier * 300 },
      { result: multiplier * 101 }
    ],
    best: 101,
    average: 185,
    ...attributes
  };
};

module.exports.Venue = withId(id => attributes => ({
  id,
  name: `Venue ${id}`,
  latitudeMicrodegrees: 0,
  longitudeMicrodegrees: 0,
  timezone: 'UTC',
  rooms: [],
  extensions: [],
  ...attributes
}));

module.exports.Room = withId(id => attributes => ({
  id: id,
  name: `Room ${id}`,
  color: '#000000',
  activities: [],
  extensions: [],
  ...attributes
}));

module.exports.Activity = withId(id => attributes => ({
  id: id,
  name: `Activity ${id}`,
  activityCode: 'other-misc-example',
  startTime: '2020-01-01T10:00:00.000Z',
  endTime: '2020-01-01T11:00:00.000Z',
  childActivities: [],
  scrambleSetId: null,
  extensions: [],
  ...attributes
}));
