import React from 'react';
import {
  Button,
  Divider,
  Grid,
  Link,
  Hidden,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { appUrl, wcaUrl } from '../../lib/urls';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
    padding: theme.spacing(2, 0),
  },
  center: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  signInButton: {
    marginTop: theme.spacing(3),
  },
}));

function SignIn() {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" className={classes.root}>
      <Grid item xs={12} md className={classes.center}>
        <Typography variant="h5" gutterBottom>
          Use your WCA account
        </Typography>
        <Typography color="textSecondary">
          If you don't have a WCA account, you can create one{' '}
          <Link href={wcaUrl('/users/sign_up')}>here</Link>.
        </Typography>
        <Button
          size="large"
          variant="contained"
          color="primary"
          href={appUrl('/oauth/authorize')}
          className={classes.signInButton}
        >
          Sign in
        </Button>
      </Grid>
      <Hidden smDown>
        <Divider orientation="vertical" flexItem />
      </Hidden>
      <Grid item xs={12} md className={classes.center}>
        <Typography variant="h5" gutterBottom>
          Use a one-time code
        </Typography>
        <Typography color="textSecondary">
          Generate a code on your trusted device and type here to establish a
          session without going through the WCA website. This strategy is useful
          for scoretaking on an unknown machine.
        </Typography>
        {/* TODO: actually implement this feature */}
      </Grid>
    </Grid>
  );
}

export default SignIn;
