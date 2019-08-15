import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
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

const wsLink = new WebSocketLink({
  uri:
    process.env.NODE_ENV === 'production'
      ? `wss://${window.location.host}/api`
      : 'ws://localhost:4000/api',
  options: {
    reconnect: true,
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
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
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
