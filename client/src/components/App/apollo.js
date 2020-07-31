import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { Socket as PhoenixSocket } from 'phoenix';
import * as AbsintheSocket from '@absinthe/socket';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { getToken } from '../../lib/auth';

// Http link

const baseHttpLink = new HttpLink(
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

const authLink = setContext((request, { headers }) => {
  const token = getToken();
  if (!token) return { headers };
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

const httpLink =
  process.env.NODE_ENV === 'production'
    ? ApolloLink.from([authLink, retryLink, baseHttpLink])
    : ApolloLink.from([authLink, baseHttpLink]);

// WebSocket link

// Create a standard Phoenix websocket connection.
const phoenixSocket = new PhoenixSocket(
  process.env.NODE_ENV === 'production'
    ? `wss://${window.location.host}/socket`
    : 'ws://localhost:4000/socket'
);

// Wrap the Phoenix socket in an AbsintheSocket.
const absintheSocket = AbsintheSocket.create(phoenixSocket);

// Create an Apollo link from the AbsintheSocket instance.
const wsLink = createAbsintheSocketLink(absintheSocket);

// Combined link

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const cache = new InMemoryCache({
  typePolicies: {
    Country: {
      keyFields: ['iso2'],
    },
    CompetitionBrief: {
      keyFields: ['wcaId'],
    },
    Competition: {
      fields: {
        access: {
          merge(existing, incoming) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
  },
});

export const client = new ApolloClient({
  cache,
  link,
  defaultOptions: {
    watchQuery: {
      // Fetch data from cache if available, but always perform a request
      // to get the latest data.
      fetchPolicy: 'cache-and-network',
    },
  },
});
