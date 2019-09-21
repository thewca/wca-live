const printer = require('./pdf-printer');
const { times } = require('../utils');
const { roundById, personById, eventById, parseActivityCode } = require('../wcif');
const { formatById } = require('../formats');
const { friendlyRoundName } = require('../rounds');
const { eventNameById } = require('../events');
const { advancingResults } = require('../advancement');
const { countryByIso2 } = require('../countries');

/* Copied from client/src/logic/attempts.js */
const centisecondsToClockFormat = centiseconds => {
  if (!Number.isFinite(centiseconds)) return null;
  if (centiseconds === 0) return '';
  if (centiseconds === -1) return 'DNF';
  if (centiseconds === -2) return 'DNS';
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
};

const decodeMbldAttempt = value => {
  if (value <= 0) return { solved: 0, attempted: 0, centiseconds: value };
  const missed = value % 100;
  const seconds = Math.floor(value / 100) % 1e5;
  const points = 99 - (Math.floor(value / 1e7) % 100);
  const solved = points + missed;
  const attempted = solved + missed;
  const centiseconds = seconds === 99999 ? null : seconds * 100;
  return { solved, attempted, centiseconds };
};

const formatMbldAttempt = attempt => {
  const { solved, attempted, centiseconds } = decodeMbldAttempt(attempt);
  const clockFormat = new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 8)
    .replace(/^[0:]*(?!\.)/g, '');
  return `${solved}/${attempted} ${clockFormat}`;
};

const formatAttemptResult = (
  attemptResult,
  eventId,
  isAverage = false
) => {
  if (attemptResult === 0) return '';
  if (attemptResult === -1) return 'DNF';
  if (attemptResult === -2) return 'DNS';
  if (eventId === '333fm') {
    return isAverage
      ? (attemptResult / 100).toFixed(2)
      : attemptResult.toString();
  }
  if (eventId === '333mbf') return formatMbldAttempt(attemptResult);
  return centisecondsToClockFormat(attemptResult);
};
/* End of copy. */
/* Copied from client/src/logic/results-table-utils.js */
const statsToDisplay = (format, eventId) => {
  const { solveCount, sortBy } = format;
  const computeAverage = [3, 5].includes(solveCount) && eventId !== '333mbf';
  if (!computeAverage)
    return [{ name: 'Best', type: 'best', recordType: 'single' }];
  const stats = [
    { name: 'Best', type: 'best', recordType: 'single' },
    {
      name: solveCount === 3 ? 'Mean' : 'Average',
      type: 'average',
      recordType: 'average',
    },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
};
/* End of copy. */

const latinName = name => name.replace(/\s*\(.*$/, '');

const withRecordTag = (result, recordTag) => {
  if (!recordTag || recordTag === 'PB') return result;
  return [
    { text: recordTag, color: '#1976d2', fontSize: 10, bold: true },
    ' ',
    { text: result },
  ]
};

const headerCellProps = {
  border: [false, false, false, false],
  opacity: 0.54,
  bold: true,
  fontSize: 10,
  margin: [0, 2],
};

module.exports = (wcif, roundId) => {
  const round = roundById(wcif, roundId);
  const format = formatById(round.format);
  const { eventId, roundNumber } = parseActivityCode(round.id);
  const event = eventById(wcif, eventId);
  const eventName = eventNameById(event.id);
  const roundName = friendlyRoundName(roundNumber, event.rounds.length, round.cutoff);
  const advancing = advancingResults(round, wcif);
  const stats = statsToDisplay(format, eventId);

  const docDefinition = {
    pageMargins: [30, 30, 30, 30],
    pageOrientation: 'landscape',
    content: [
      {
        text: wcif.name,
        margin: [0, 0, 0, 4],
        fontSize: 20,
      },
      {
        text: `${eventName} - ${roundName}`,
        margin: [0, 0, 0, 8],
        fontSize: 16,
        opacity: 0.54,
      },
      {
        table: {
          widths: ['auto', 'auto', 'auto', ...times(format.solveCount + stats.length, () => '*')],
          headerRows: 1,
          body: [
            /* Header */
            [
              {
                text: '#',
                alignment: 'right',
                ...headerCellProps,
              },
              {
                text: 'Name',
                ...headerCellProps,
              },
              {
                text: 'Country',
                ...headerCellProps,
              },
              ...times(format.solveCount, index => ({
                text: (index + 1).toString(),
                alignment: 'right',
                ...headerCellProps
              })),
              ...stats.map(({ name }) => ({
                text: name,
                alignment: 'right',
                ...headerCellProps
              })),
            ],
            /* Rows */
            ...round.results.map(result => {
              const person = personById(wcif, result.personId);
              const attempts = result.attempts.map(attempt => attempt.result);
              const advancable = advancing.includes(result);
              return [
                {
                  text: result.ranking,
                  alignment: 'right',
                  fillColor: advancable ? '#00e676' : undefined,
                },
                {
                  text: latinName(person.name),
                },
                {
                  text: countryByIso2(person.countryIso2).name,
                },
                ...times(format.solveCount, index => ({
                  text: formatAttemptResult(attempts[index] || 0, eventId),
                  alignment: 'right',
                })),
                ...stats.map(({ type, recordType }, index) => ({
                  text: withRecordTag(
                    formatAttemptResult(result[type], eventId, type === 'average'),
                    result.recordTags[recordType]
                  ),
                  alignment: 'right',
                  bold: index === 0,
                })),
              ];
            })
          ],
        },
        layout: {
          paddingLeft: () => 8,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
          vLineWidth: () => 0,
          hLineColor: () => '#e0e0e0',
          hLineWidth: () => 0.5,
        },
      },
    ],
    defaultStyle: { font: 'Roboto', fontSize: 12, opacity: 0.87 },
  };

  return printer.createPdfKitDocument(docDefinition, {});
};
