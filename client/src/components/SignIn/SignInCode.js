import React from 'react';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import SignInCodeForm from './SignInCodeForm';
import useApolloErrorHandler from '../../hooks/useApolloErrorHandler';
import { storeToken } from '../../lib/auth';

const SIGN_IN = gql`
  mutation SignIn($code: String!) {
    signIn(input: { code: $code }) {
      token
    }
  }
`;

function SignInCode() {
  const apolloErrorHandler = useApolloErrorHandler();
  const apolloClient = useApolloClient();
  const navigate = useNavigate();

  const [signIn, { loading }] = useMutation(SIGN_IN, {
    onError: apolloErrorHandler,
    onCompleted: ({ signIn: { token } }) => {
      storeToken(token);
      navigate('/');
      apolloClient.resetStore();
    },
  });

  function handleSubmit(code) {
    signIn({ variables: { code } });
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
