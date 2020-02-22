const events = [
  {
    id: '333',
    name: '3x3x3 Cube',
  },
  {
    id: '222',
    name: '2x2x2 Cube',
  },
  {
    id: '444',
    name: '4x4x4 Cube',
  },
  {
    id: '555',
    name: '5x5x5 Cube',
  },
  {
    id: '666',
    name: '6x6x6 Cube',
  },
  {
    id: '777',
    name: '7x7x7 Cube',
  },
  {
    id: '333bf',
    name: '3x3x3 Blindfolded',
  },
  {
    id: '333fm',
    name: '3x3x3 Fewest Moves',
  },
  {
    id: '333oh',
    name: '3x3x3 One-Handed',
  },
  {
    id: '333ft',
    name: '3x3x3 With Feet',
  },
  {
    id: 'minx',
    name: 'Megaminx',
  },
  {
    id: 'pyram',
    name: 'Pyraminx',
  },
  {
    id: 'clock',
    name: 'Clock',
  },
  {
    id: 'skewb',
    name: 'Skewb',
  },
  {
    id: 'sq1',
    name: 'Square-1',
  },
  {
    id: '444bf',
    name: '4x4x4 Blindfolded',
  },
  {
    id: '555bf',
    name: '5x5x5 Blindfolded',
  },
  {
    id: '333mbf',
    name: '3x3x3 Multi-Blind',
  },
];

const eventNameById = eventId => {
  return events.find(event => event.id === eventId).name;
};

const eventIndexById = eventId => {
  return events.findIndex(event => event.id === eventId);
};

module.exports = {
  eventNameById,
  eventIndexById,
};
