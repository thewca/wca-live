const { average, best } = require('./calculations');
const { sortByArray } = require('./utils');
const { personById } = require('./wcif');
const { formatById } = require('./formats');

const setRankings = (results, formatId) => {
  const { sortBy } = formatById(formatId);
  rankingOrder = sortBy === 'best' ? ['best'] : ['average', 'best'];
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

const satisfiesAdvancementCondition = (result, advancementCondition, resultCount) => {
  const { type, level } = advancementCondition;
  if (type === 'ranking') return result.ranking <= level;
  if (type === 'percent') return result.ranking <= Math.floor(resultCount * level * 0.01);
  if (type === 'attemptResult') return result.attempts.some(attempt => attempt.result > 0 && attempt.result < level);
  throw new Error(`Unrecognised AdvancementCondition type: '${type}'`);
};

const setAdvancable = (results, advancementCondition) => {
  results.forEach(result => result.advancable = false);
  if (!advancementCondition) {
    /* Mark top 3 in the finals. */
    results
      .filter(({ ranking }) => ranking && ranking <= 3)
      .forEach(result => result.advancable = true);
  } else {
    /* See: https://www.worldcubeassociation.org/regulations/#9p1 */
    const maxAdvanceable = Math.floor(results.length * 0.75);
    const maxRank = Math.max(...results.map(({ ranking }) => ranking).filter(x => x));
    const firstNonAdvancingRank = results[maxAdvanceable].ranking || maxRank + 1;
    results
      /* Note: this ensures that people who tied either advance altogether or not. */
      .filter(({ ranking }) => ranking && ranking < firstNonAdvancingRank)
      .filter(result => satisfiesAdvancementCondition(result, advancementCondition, results.length))
      .forEach(result => result.advancable = true);
  }
};

module.exports = {
  setRankings,
  sortResults,
  setAdvancable,
};
