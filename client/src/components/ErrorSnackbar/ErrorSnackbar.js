import React from 'react';
import Portal from '@material-ui/core/Portal';

import ClosableSnackbar from '../ClosableSnackbar/ClosableSnackbar';

function ErrorSnackbar({ error = null }) {
  const message =
    error && error.graphQLErrors.length > 0
      ? error.graphQLErrors[0].message
      : 'Something went wrong 😔';

  /* Make sure the snackbar is rendered relatively to the body. (https://github.com/mui-org/material-ui/issues/12201#issuecomment-406434406) */
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
