const { MongoClient, Logger } = require('mongodb');
const { MONGO_URI, PRODUCTION } = require('./config');

module.exports = async () => {
  const client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true });
  const db = client.db();
  if (!PRODUCTION) {
    let queryNumber = 1;
    Logger.setLevel('debug');
    Logger.filter('class', ['Cursor']);
    Logger.setCurrentLogger(message => {
      console.log(`${queryNumber++} ${message}\n`);
    });
  }
  return {
    client,
    Users: db.collection('users'),
    Competitions: db.collection('competitions'),
  };
};
