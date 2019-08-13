/**
 * This module loads current records using WCA API and updates them periodically.
 */

const wcaApi = require('./wca-api');

const cache = { recordById: null };

const updateRecords = async () => {
  try {
    const recordsJson = await wcaApi().getRecords();
    cache.recordById = recordsJsonToRecordById(recordsJson);
  } catch (error) {
    console.log(`Failed to load records: ${error}`);
  }
};

const getRecordByIdCopy = () => {
  /* If we don't have recordbyId, return proxy object that for any given reacord id
     returns smallest posible result value to avoid false positives. */
  return cache.recordById
    ? { ...cache.recordById }
    : new Proxy({}, { get: () => 1 });
};

const recordId = (eventId, type, scopeId) => {
  return `${eventId}-${type}-${scopeId}`;
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

/* Initialization */

updateRecords();
setInterval(updateRecords, 10 * 60 * 1000); /* Update records every 10 minutes. */

module.exports = {
  recordId,
  getRecordByIdCopy,
};
