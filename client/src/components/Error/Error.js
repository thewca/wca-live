import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';
import errorImage from './error.svg';
import { apolloErrorToMessage } from '../../lib/errors';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(3),
  },
  image: {
    maxWidth: '100%',
  },
}));

function Error({ error = null }) {
  const classes = useStyles();

  const message = apolloErrorToMessage(error);

  return (
    <div className={classes.root}>
      <Grid container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <Typography variant="h5">Oh dear!</Typography>
        </Grid>
        <Grid item>
          <img
            src={errorImage}
            height="300"
            alt="error"
            className={classes.image}
          />
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{message}</Typography>
        </Grid>
      </Grid>
    </div>
  );
}

export default Error;
