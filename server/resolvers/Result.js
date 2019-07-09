module.exports = {
  person: ({ personId }, args, { competition }) => {
    return competition.wcif.persons.find(
      person => person.registrantId === personId
    );
  },
  attempts: ({ attempts }) => {
    return attempts.map(({ result }) => result);
  },
};
