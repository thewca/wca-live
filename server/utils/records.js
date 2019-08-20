/**
 * This module loads current records using WCA API and updates them periodically.
 */

const wcaApi = require('./wca-api');

const cache = { recordById: null };

/* Initialize records and set up a periodical update. */
const initialize = async () => {
  try {
    await updateRecords();
  } catch (error) {
    throw new Error(`Failed to load records: ${error}`);
  }
  /* Update records every hour. */
  setInterval(async () => {
    try {
      await updateRecords();
    } catch(e) {
      console.error(`Failed to update records: ${error}`);
    }
  }, 60 * 60 * 1000);
};

const updateRecords = async () => {
  const recordsJson = await wcaApi().getRecords();
  cache.recordById = recordsJsonToRecordById(recordsJson);
};

const recordsJsonToRecordById = ({
  world_records: world,
  continental_records: continental,
  national_records: national,
}) => {
  const recordById = {};
  const addRecordsByEvent = (recordsByEvent, scopeId) => {
    Object.entries(recordsByEvent).forEach(([eventId, { average, single }]) => {
      recordById[recordId(eventId, 'single', scopeId)] = single;
      if (average) {
        recordById[recordId(eventId, 'average', scopeId)] = average;
      }
    });
  };
  addRecordsByEvent(world, 'world');
  Object.entries(continental).forEach(([continentId, recordsByEvent]) => {
    addRecordsByEvent(recordsByEvent, continentId);
  });
  Object.entries(national).forEach(([countryId, recordsByEvent]) => {
    addRecordsByEvent(recordsByEvent, countryId);
  });
  return recordById;
};

const getRecordByIdCopy = () => {
  if (!cache.recordById) {
    throw new Error(`Records haven't been initialized yet.`);
  }
  return { ...cache.recordById };
};

const recordId = (eventId, type, scopeId) => {
  return `${eventId}-${type}-${scopeId}`;
};

module.exports = {
  initialize,
  getRecordByIdCopy,
  recordId,
};
