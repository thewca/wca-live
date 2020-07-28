import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { formatSentence } from '../../lib/utils';
import errorImage from './error.svg';
import { Typography, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  image: {
    maxWidth: '100%',
  },
}));

function apolloErrorToMessage(error) {
  if (error && error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors
      .map((error) => error.message)
      .map(formatSentence)
      .join(' ');
  } else {
    return 'Something went wrong.';
  }
}

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
