import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ConfirmProvider } from 'material-ui-confirm';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import Navigation from '../Navigation/Navigation';

const App = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ThemeProvider>
        <ConfirmProvider>
          <CssBaseline />
          <Navigation />
        </ConfirmProvider>
      </ThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
);

export default App;
