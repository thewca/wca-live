import React from 'react';
import { Portal } from '@material-ui/core';
import ClosableSnackbar from '../ClosableSnackbar/ClosableSnackbar';
import { formatSentence } from '../../lib/utils';

function apolloErrorToMessage(error) {
  if (error && error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors
      .map((error) => error.message)
      .map(formatSentence)
      .join(' ');
  } else {
    return 'Something went wrong 😔';
  }
}

function ErrorSnackbar({ error = null }) {
  const message = apolloErrorToMessage(error);

  // Portal ensures the snackbar is rendered relatively to the body.
  // See: https://github.com/mui-org/material-ui/issues/12201#issuecomment-406434406
  return (
    <Portal>
      <ClosableSnackbar
        message={message}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      />
    </Portal>
  );
}

export default ErrorSnackbar;
