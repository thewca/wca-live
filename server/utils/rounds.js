const roundName = (roundNumber, numberOfRounds, cutoff) => {
  if (roundNumber === numberOfRounds) {
    return cutoff ? 'Combined Final' : 'Final';
  }
  if (roundNumber === 1) {
    return cutoff ? 'Combined First' : 'First Round';
  }
  if (number === 2) {
    return cutoff ? 'Combined Second' : 'Second Round';
  }
  if (number === 3) {
    return cutoff ? 'Combined Third' : 'Semi Final'
  }
  return null;
};

module.exports = {
  roundName,
};
