import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Portal from '@material-ui/core/Portal';

const ErrorSnackbar = ({ error = null }) => {
  const message =
    error && error.graphQLErrors.length > 0
      ? error.graphQLErrors[0].message
      : 'Something went wrong 😔';
  const [open, setOpen] = useState(true);

  /* Make sure the snackbar is rendered relatively to the body. (https://github.com/mui-org/material-ui/issues/12201#issuecomment-406434406) */
  return (
    <Portal>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={open}
        message={message}
        action={
          <IconButton color="inherit" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        }
      />
    </Portal>
  );
};

export default ErrorSnackbar;
