const withWcif = wcif => object => {
  return { ...object, wcif };
};

module.exports = {
  withWcif,
};
