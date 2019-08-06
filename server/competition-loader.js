/**
 * This module is a caching layer over the database 'competitions' collection.
 * It exposes functions for getting/saving a competition, while keeping
 * CACHED_COMPETITION_COUNT most recently accessed competitions in memory.
 * From the application nature there are only several highly-accessed
 * competitions at the given time and keeping them in memory speeds up loading,
 * reduces database load and reduces memory usage as we don't load
 * the same competition into memory several times.
 */

module.exports = ({ Competitions }) => {
  const CACHED_COMPETITION_COUNT = 20;
  const cachedCompetitions = [];

  const get = async (wcifId) => {
    const cachedIndex = cachedCompetitions.findIndex(
      cached => cached.wcif.id === wcifId
    );
    if (cachedIndex !== -1) {
      const cachedCompetition = cachedCompetitions[cachedIndex];
      cachedCompetitions.splice(cachedIndex, 1);
      cachedCompetitions.push(cachedCompetition);
      return cachedCompetition;
    } else {
      const competition = await Competitions.findOne({ 'wcif.id': wcifId });
      /* Check if it hasn't been added to the cache while we were loading. */
      const inCache = cachedCompetitions.some(cached => cached.wcif.id === wcifId);
      if (!inCache) {
        cachedCompetitions.push(competition);
        if (cachedCompetitions.length > CACHED_COMPETITION_COUNT) {
          cachedCompetitions.shift();
        }
      }
      return competition;
    }
  };

  const update = async (competition, { resultsOnly }) => {
    const updateObj = resultsOnly
      ? { $set: { 'wcif.events': competition.wcif.events } }
      : competition;
    const { value: updatedCompetition } = await Competitions.findOneAndUpdate(
      { 'wcif.id': competition.wcif.id },
      updateObj,
      { returnOriginal: false }
    );
    if (!update) throw new Error('Competition not found.');
    const cachedIndex = cachedCompetitions.findIndex(
      cached => cached.wcif.id === competition.wcif.id
    );
    if (cachedIndex !== -1) {
      cachedCompetitions.splice(cachedIndex, 1);
      cachedCompetitions.push(updatedCompetition);
    } else {
      cachedCompetitions.push(updatedCompetition);
      if (cachedCompetitions.length > CACHED_COMPETITION_COUNT) {
        cachedCompetitions.shift();
      }
    }
    return updatedCompetition;
  };

  const taskQueueByWcifId = {};

  const executeTasks = async (wcifId) => {
    if (taskQueueByWcifId[wcifId].length > 0) {
      const { task, resolve, reject } = taskQueueByWcifId[wcifId][0];
      try {
        resolve(await task());
      } catch (error) {
        reject(error);
      } finally {
        taskQueueByWcifId[wcifId].shift();
      }
      /* Once the task is finished, kick off another tasks execution. */
      executeTasks(wcifId);
    }
  };

  /**
   * Takes a function and registers it as a 'task' for the given competition.
   * Ensures that only one such 'task' is running for the given competition at the given time
   * (i.e. that all 'tasks' are executed sequentially one by one).
   * Resolves to whatever the given function resolves to.
   *
   * Example: you can wrap an 'update sequence' of actions like
   * <get competition, do stuff, save competition>
   * in a 'task' function and pass it to executeTask.
   * This ensures that all of these actions are finished before another
   * 'update sequence' is started for the same competition.
   * This prevents race conditions.
   */
  const executeTask = (wcifId, task) => {
    taskQueueByWcifId[wcifId] = taskQueueByWcifId[wcifId] || [];
    return new Promise((resolve, reject) => {
      taskQueueByWcifId[wcifId].push({ task, resolve, reject });
      /* If it's the only task then we need to kick off tasks execution.
         Otherwise it will be executed when the current task is finished. */
      if (taskQueueByWcifId[wcifId].length === 1) {
        executeTasks(wcifId);
      }
    });
  };

  return {
    get,
    update,
    executeTask,
  };
};
