import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import errorImage from './error.svg';
import { apolloErrorToMessage } from '../../lib/errors';

function Error({ error = null }) {
  const message = apolloErrorToMessage(error);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <Typography variant="h5">Oh dear!</Typography>
        </Grid>
        <Grid item>
          <Box
            component="img"
            src={errorImage}
            height="300"
            alt="error"
            sx={{ maxWidth: '100%' }}
          />
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{message}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Error;
