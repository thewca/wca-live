const { MongoClient, Logger } = require('mongodb');
const { MONGO_URI, PRODUCTION } = require('./config');

module.exports.db = {};

module.exports.connect = async () => {
  const client = await MongoClient.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db();
  if (!PRODUCTION) {
    let queryNumber = 1;
    Logger.setLevel('debug');
    Logger.filter('class', ['Cursor']);
    Logger.setCurrentLogger(message => {
      console.log(`${queryNumber++} ${message}\n`);
    });
  }
  Object.assign(module.exports.db, {
    client,
    users: db.collection('users'),
    competitions: db.collection('competitions'),
    data: db.collection('data'),
  });
  /* Create indices */
  db.collection('competitions').createIndex(
    {
      'wcif.schedule.startDate': 1,
      'wcif.schedule.numberOfDays': 1,
      'wcif.shortName': 1,
    },
    { name: 'Competition list query' }
  );
};
