const completed = attempt => attempt > 0;

const skipped = attempt => attempt === 0;

const compareAttempts = (attempt1, attempt2) => {
  if (attempt1 <= 0 || attempt2 <= 0) return attempt2 - attempt1;
  return attempt1 - attempt2;
}

/* See: https://www.worldcubeassociation.org/regulations/#9f2 */
const roundOver10Mins = average => {
  if (average <= 10 * 6000) return average;
  return Math.round(average / 100) * 100;
}

const ao5 = attempts => {
  if (attempts.length !== 5) return null;
  if (attempts.some(skipped)) return 0;
  const [, a, b, c, ] = attempts.slice().sort(compareAttempts);
  if (!completed(c)) return -1;
  return Math.round((a + b + c) / 3);
};

const mo3 = attempts => {
  if (attempts.length !== 3) return null;
  if (attempts.some(skipped)) return 0;
  if (!attempts.every(completed)) return -1;
  return Math.round(attempts.reduce((x, y) => x + y) / 3);
};

export const average = (attempts, eventId) => {
  if (eventId === '333fm') {
    return mo3(attempts.map(attempt => attempt * 100));
  }
  return roundOver10Mins(
    attempts.length === 5 ? ao5(attempts) : mo3(attempts)
  );
};

export const best = attempts => {
  if (attempts.every(skipped)) return 0;
  const completedAttempts = attempts.filter(completed);
  if (completedAttempts.length === 0) return -1;
  return Math.min(...completedAttempts);
};
