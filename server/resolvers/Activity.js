module.exports = {
  _id: ({ id, wcif }) => {
    return `${wcif.id}:${id}`;
  },
};
