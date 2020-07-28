import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ConfirmProvider } from 'material-ui-confirm';
import { ApolloProvider } from '@apollo/client';
import { SnackbarProvider } from 'notistack';
import { client } from './apollo';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import Navigation from '../Navigation/Navigation';

function App() {
  return (
    <Router>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <SnackbarProvider
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <ConfirmProvider>
              <CssBaseline />
              <Navigation />
            </ConfirmProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    </Router>
  );
}

export default App;
