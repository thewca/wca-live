const { getRecords } = require('./wca-api');

const recordId = (eventId, type, scopeId) => {
  return `${eventId}-${type}-${scopeId}`;
};

const processRecordsResonse = ({
  world_records: world,
  continental_records: continental,
  national_records: national,
}) => {
  const newRecords = {};
  const setRecordsByEvent = (recordsByEvent, scopeId) => {
    Object.entries(recordsByEvent).forEach(([eventId, { average, single }]) => {
      newRecords[recordId(eventId, 'single', scopeId)] = single;
      if (average) {
        newRecords[recordId(eventId, 'average', scopeId)] = average;
      }
    });
  };
  setRecordsByEvent(world, 'world');
  Object.entries(continental).forEach(([continentId, recordsByEvent]) => {
    setRecordsByEvent(recordsByEvent, continentId);
  });
  Object.entries(national).forEach(([countryId, recordsByEvent]) => {
    setRecordsByEvent(recordsByEvent, countryId);
  });
  return newRecords;
};

const cache = { records: null };

const updateRecords = async () => {
  try {
    cache.records = processRecordsResonse(await getRecords());
  } catch (error) {
    console.log(`Failed to load records: ${error}`);
  }
};

const cloneRecords = () => ({ ...cache.records });

/* Initialization */
updateRecords();
setInterval(updateRecords, 10 * 60 * 1000); /* Update records every 10 minutes. */

module.exports = {
  cloneRecords,
  recordId,
};
