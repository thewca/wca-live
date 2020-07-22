import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const httpLink = new HttpLink(
  process.env.NODE_ENV === 'production'
    ? { uri: '/api', credentials: 'same-origin' }
    : { uri: 'http://localhost:4000/api', credentials: 'include' }
);

const retryLink = new RetryLink({
  delay: {
    initial: 2000,
  },
  attempts: {
    max: 2,
  },
});

const retryHttpLink =
  process.env.NODE_ENV === 'production'
    ? ApolloLink.from([retryLink, httpLink])
    : httpLink;

const wsLink = new WebSocketLink({
  uri:
    process.env.NODE_ENV === 'production'
      ? `wss://${window.location.host}/api`
      : 'ws://localhost:4000/api',
  options: {
    reconnect: true,
    /* Establish the connection lazily and disconnect when there are no active
       subscriptions to reduce the number of websocket connections. */
    lazy: true,
    inactivityTimeout: 10000,
  },
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  retryHttpLink
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
  defaultOptions: {
    watchQuery: {
      // Fetch data from cache if available, but always perform a request
      // to get the latest data.
      fetchPolicy: 'cache-and-network',
    },
  },
});
