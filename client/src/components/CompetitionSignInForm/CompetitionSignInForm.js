import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

const SIGN_IN_MUTATION = gql`
  mutation SignIn($competitionId: ID!, $password: String!) {
    signIn(competitionId: $competitionId, password: $password)
  }
`;

const CompetitionSignInForm = ({ history }) => {
  const [competitionId, setCompetitionId] = useState('');
  const [password, setPassword] = useState('');

  const [signIn, { loading, error }] = useMutation(SIGN_IN_MUTATION, {
    variables: { competitionId, password },
    onCompleted: (data) => {
      if (data.signIn) {
        history.push(`/admin/competitions/${competitionId}`);
      }
    },
  });

  return (
    <Box p={2}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <TextField
            label="Competition ID"
            variant="outlined"
            value={competitionId}
            onChange={(event) => setCompetitionId(event.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={signIn}
            disabled={loading || !competitionId || !password}
          >
            Sign in
          </Button>
          {error && <ErrorSnackbar error={error} />}
        </Grid>
      </Grid>
    </Box>
  );
};

export default withRouter(CompetitionSignInForm);
