import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

const ErrorSnackbar = ({ message }) => {
  const [open, setOpen] = useState(true);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={open}
      message={message}
      action={
        <IconButton color="inherit" onClick={() => setOpen(false)}>
          <Icon>close</Icon>
        </IconButton>
      }
    />
  );
};

export default ErrorSnackbar;
