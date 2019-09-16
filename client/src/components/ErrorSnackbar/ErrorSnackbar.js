import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

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
          <CloseIcon />
        </IconButton>
      }
    />
  );
};

export default ErrorSnackbar;
