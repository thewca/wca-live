/* Temporarily it's a copy of server/utils/stats.js */

const complete = attempt => attempt > 0;

const skipped = attempt => attempt === 0;

const compareAttempts = (attempt1, attempt2) => {
  if (!complete(attempt1) && !complete(attempt2)) return 0;
  if (!complete(attempt1) && complete(attempt2)) return 1;
  if (complete(attempt1) && !complete(attempt2)) return -1;
  return attempt1 - attempt2;
};

/* See: https://www.worldcubeassociation.org/regulations/#9f2 */
export const roundOver10Mins = average => {
  if (average <= 10 * 6000) return average;
  return Math.round(average / 100) * 100;
};

const mathMean = (a, b, c) => {
  return Math.round((a + b + c) / 3);
};

const ao5 = attempts => {
  const [, a, b, c] = attempts.slice().sort(compareAttempts);
  if (!complete(c)) return -1;
  return mathMean(a, b, c);
};

const mo3 = attempts => {
  if (!attempts.every(complete)) return -1;
  return mathMean(...attempts);
};

/* Adds 0 for missing attempts, so they conform to the given length. */
const normalizeAttempts = (attempts, solveCount) => {
  return Array.from({ length: solveCount }, (_, index) => attempts[index] || 0);
};

export const average = (attempts, eventId, expectedSolveCount) => {
  if (!eventId) {
    /* If eventId is omitted, the average is still calculated correctly except for FMC
       and that may be a hard to spot bug, so better enforce explicity here. */
    throw new Error('Missing argument: eventId');
  }
  if (![3, 5].includes(expectedSolveCount)) return 0;
  if (eventId === '333mbf') return 0;
  const normalized = normalizeAttempts(attempts, expectedSolveCount);
  if (normalized.some(skipped)) return 0;
  const calcFunction = normalized.length === 5 ? ao5 : mo3;
  if (eventId === '333fm') {
    return calcFunction(normalized.map(attempt => attempt * 100));
  }
  return roundOver10Mins(calcFunction(normalized));
};

export const best = attempts => {
  const nonSkipped = attempts.filter(attempt => !skipped(attempt));
  if (nonSkipped.length === 0) return 0;
  const completeAttempts = nonSkipped.filter(complete);
  if (completeAttempts.length > 0) {
    return Math.min(...completeAttempts);
  } else {
    return Math.max(...nonSkipped);
  }
};
