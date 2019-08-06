const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();
/* PubSub is backed by EventEmitter by default, which starts throwing warnings
   when the number of listeners (subscribers) exceeds 10.
   That's to avoid accidental memory leaks (https://nodejs.org/api/events.html#events_emitter_setmaxlisteners_n).
   Here we don't have a memory leak - the number of subscribers
   is directly proportional to the number of clients we have.
   (https://github.com/apollographql/graphql-subscriptions/issues/120#issuecomment-348967908) */
pubsub.ee.setMaxListeners(10000);

module.exports = pubsub;
