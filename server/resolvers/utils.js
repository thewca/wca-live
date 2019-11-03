/**
 * A helper taking WCIF and returning a function attaching the WCIF to whatever object is given.
 */
const withWcif = wcif => object => {
  return { ...object, wcif };
};

module.exports = {
  withWcif,
};
