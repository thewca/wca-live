import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { formatSentence } from '../../lib/utils';

import SignInCodeForm from './SignInCodeForm';
import { signInByCode } from '../../lib/auth';

function SignInCode() {
  const apolloClient = useApolloClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  function handleSubmit(code) {
    setLoading(true);

    signInByCode(code).then(({ status, message }) => {
      setLoading(false);

      if (status === 'ok') {
        navigate('/');
        apolloClient.resetStore();
      } else {
        enqueueSnackbar(formatSentence(message), { variant: 'error' });
      }
    });
  }

  return (
    <Grid container direction="column" spacing={2} alignItems="center">
      <Grid item>
        <Typography variant="h5" gutterBottom align="center">
          Use a one-time code
        </Typography>
        <Typography color="textSecondary" align="center">
          Generate a code on your trusted device and type here to establish a
          session without going through the WCA website. This strategy is useful
          for scoretaking on an unknown machine.
        </Typography>
      </Grid>
      <Grid item>
        <SignInCodeForm onSubmit={handleSubmit} disabled={loading} />
      </Grid>
    </Grid>
  );
}

export default SignInCode;
