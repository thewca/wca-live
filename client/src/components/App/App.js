import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { RetryLink } from 'apollo-link-retry';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import Navigation from '../Navigation/Navigation';

/* Apollo configuration */

const httpLink = createHttpLink(
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

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    /*
     * Modified version of https://github.com/apollographql/apollo-client/blob/ecaa058388092c7079d77e1d4357da0e4223b076/packages/apollo-cache-inmemory/src/inMemoryCache.ts#L40-L50
     * to always look at _id as the unique indentifier instead of id first.
     * See https://www.apollographql.com/docs/react/caching/cache-configuration/#custom-identifiers
     **/
    dataIdFromObject: result => {
      if (result.__typename) {
        if (result._id !== undefined) {
          return `${result.__typename}:${result._id}`;
        }
        if (result.id !== undefined) {
          return `${result.__typename}:${result.id}`;
        }
      }
      return null;
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

const App = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ThemeProvider>
        <CssBaseline />
        <Navigation />
      </ThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
);

export default App;
