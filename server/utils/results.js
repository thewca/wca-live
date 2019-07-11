const { average, best } = require('./calculations');
const { sortByArray } = require('./utils');
const { personById } = require('./wcif');

const setRankings = (results, rankingOrder) => {
  const cache = { average: {}, best: {} };

  results.forEach(result => result.ranking = null);
  results = results.filter(result =>
    result.attempts.some(({ result }) => result !== 0)
  );

  results.forEach(result => {
    const attempts = result.attempts.map(({ result }) => result);
    if (rankingOrder.includes('average')) {
      const avg = average(attempts);
      cache.average[result.personId] = avg > 0 ? avg : Infinity;
    }
    const bst = best(attempts);
    cache.best[result.personId] = bst > 0 ? bst : Infinity;
  });

  results = sortByArray(results, result =>
    rankingOrder.map(type => cache[type][result.personId])
  );

  results.reduce((prevResult, result, index) => {
    const tiedPrevious = prevResult && rankingOrder.every(
      type => cache[type][result.personId] === cache[type][prevResult.personId]
    );
    result.ranking = tiedPrevious ? prevResult.ranking : index + 1;
    return result;
  }, null);
};

const sortResults = (results, wcif) => {
  return sortByArray(results, result => [
    result.ranking ? result.ranking : Infinity,
    personById(wcif, result.personId).name,
  ]);
};

module.exports = {
  setRankings,
  sortResults,
};
