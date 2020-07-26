import React from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import CompetitionSignInForm from '../../CompetitionSignInForm/CompetitionSignInForm';
import { appUrl } from '../../../lib/urls';

const useStyles = makeStyles((theme) => ({
  screenHeight: {
    height: '100vh',
  },
  center: {
    textAlign: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

function AdminSignIn() {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" className={classes.screenHeight}>
      <Grid item xs={12} md className={classes.center}>
        <Typography variant="h5" className={classes.title}>
          Use your WCA account
        </Typography>
        <Button
          size="large"
          variant="outlined"
          color="primary"
          href={appUrl('/oauth/authorize')}
        >
          Sign in
        </Button>
      </Grid>
      <Hidden smDown>
        <Divider orientation="vertical" />
      </Hidden>
      <Grid item xs={12} md className={classes.center}>
        <Typography variant="h5" className={classes.title}>
          Use competition dedicated password
        </Typography>
        <CompetitionSignInForm />
      </Grid>
    </Grid>
  );
}

export default AdminSignIn;
