module.exports = {
  competitors: ({ persons }) => {
    return persons.filter(({ registration }) =>
      registration && registration.status === 'accepted'
    );
  },
};
