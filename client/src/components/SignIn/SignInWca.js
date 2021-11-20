import React from 'react';
import { Button, Grid, Link, Typography } from '@mui/material';
import { appUrl, wcaUrl } from '../../lib/urls';

function SignInWca() {
  return (
    <Grid container direction="column" spacing={3} alignItems="center">
      <Grid item>
        <Typography variant="h5" gutterBottom align="center">
          Use your WCA account
        </Typography>
        <Typography color="textSecondary" align="center">
          If you don't have a WCA account, you can create one{' '}
          <Link href={wcaUrl('/users/sign_up')} underline="hover">
            here
          </Link>
          .
        </Typography>
      </Grid>
      <Grid item>
        <Button
          size="large"
          variant="contained"
          color="primary"
          href={appUrl('/oauth/authorize')}
        >
          Sign in
        </Button>
      </Grid>
    </Grid>
  );
}

export default SignInWca;
