/**
 * This module loads current records using WCA API and updates them periodically.
 * Any time we load new records we also store them in the database to speed up initialization.
 */

const wcaApi = require('./wca-api');
const { db } = require('../mongo-connector');

const cache = { recordById: null };

/* Initialize records and set up a periodical update. */
const initialize = async () => {
  try {
    const recordsData = await db.data.findOne({ id: 'records' });
    if (recordsData) {
      if (recordsData.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        cache.recordById = recordsData.recordById;
      } else {
        try {
          await updateRecords();
        } catch (error) {
          console.log(`Failed to load new records: ${error}. Using old ones.`);
          cache.recordById = recordsData.recordById;
        }
      }
    } else {
      await updateRecords();
    }
  } catch (error) {
    throw new Error(`Failed to initialize records: ${error}`);
  }
  /* Update records every hour. */
  setInterval(async () => {
    try {
      await updateRecords();
    } catch (error) {
      console.error(`Failed to update records: ${error}`);
    }
  }, 60 * 60 * 1000);
};

const updateRecords = async () => {
  const recordsJson = await wcaApi().getRecords();
  cache.recordById = recordsJsonToRecordById(recordsJson);
  await db.data.findOneAndUpdate(
    { id: 'records' },
    { $set: { recordById: cache.recordById, updatedAt: new Date() } },
    { upsert: true }
  );
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
