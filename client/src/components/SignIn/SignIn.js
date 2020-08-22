import React from 'react';
import { Divider, Grid, Hidden, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SignInCode from './SignInCode';
import SignInWca from './SignInWca';

const useStyles = makeStyles((theme) => ({
  fullHeight: {
    height: '100%',
  },
}));

function SignIn() {
  const classes = useStyles();

  return (
    <Box p={4} className={classes.fullHeight}>
      <Grid
        container
        alignItems="center"
        className={classes.fullHeight}
        spacing={4}
      >
        <Grid item xs={12} md>
          <SignInWca />
        </Grid>
        <Hidden smDown>
          <Divider orientation="vertical" flexItem />
        </Hidden>
        <Grid item xs={12} md>
          <SignInCode />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SignIn;
