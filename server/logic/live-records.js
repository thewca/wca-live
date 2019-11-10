const { flatMap, sortByArray, groupBy } = require('./utils');
const { dateToUTCDateString } = require('./date');
const { recordId } = require('./records');
const { tagsWithRecordId } = require('./results');
const { eventIndexById } = require('./events');

const isVisibleRecordTag = tag => ['WR', 'CR', 'NR'].includes(tag);

const computeRecords = competitions => {
  const allRecords = flatMap(competitions, competition => {
    return flatMap(competition.wcif.events, event => {
      return flatMap(event.rounds, round => {
        const singleRecords = round.results
          .filter(result => isVisibleRecordTag(result.recordTags.single))
          .map(result => ({
            competition,
            event,
            round,
            result,
            type: 'single',
            recordTag: result.recordTags.single,
            attemptResult: result.best,
          }));
        const averageRecords = round.results
          .filter(result => isVisibleRecordTag(result.recordTags.average))
          .map(result => ({
            competition,
            event,
            round,
            result,
            type: 'average',
            recordTag: result.recordTags.average,
            attemptResult: result.average,
          }));
        return [...averageRecords, ...singleRecords];
      });
    });
  });
  const recordsByRecordId = groupBy(allRecords, record => {
    const { recordId } = tagsWithRecordId(
      record.competition.wcif,
      record.result.personId,
      record.event.id,
      record.type
    ).find(({ tag }) => tag === record.recordTag);
    return recordId;
  });
  const records = flatMap(Object.values(recordsByRecordId), records => {
    const minAttemptResult = Math.min(...records.map(record => record.attemptResult));
    return records.filter(record => record.attemptResult === minAttemptResult);
  });
  return sortByArray(records, record => [
    ['WR', 'CR', 'NR'].indexOf(record.recordTag),
    eventIndexById(record.event.id),
    ['single', 'average'].indexOf(record.type),
    record.attemptResult,
  ]);
};

module.exports = {
  computeRecords,
};
