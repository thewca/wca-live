import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Button, Grid, Typography } from '@material-ui/core';
import useApolloErrorHandler from '../../hooks/useApolloErrorHandler';
import CodeDialog from './CodeDialog';

const GENERATE_ONE_TIME_CODE = gql`
  mutation GenerateOneTimeCode {
    generateOneTimeCode {
      oneTimeCode {
        id
        code
        expiresAt
        insertedAt
      }
    }
  }
`;

function OneTimeCode() {
  const apolloErrorHandler = useApolloErrorHandler();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [generateOneTimeCode, { data, loading }] = useMutation(
    GENERATE_ONE_TIME_CODE,
    {
      onError: apolloErrorHandler,
      onCompleted: () => setDialogOpen(true),
    }
  );

  const oneTimeCode = data ? data.generateOneTimeCode.oneTimeCode : null;

  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            One-time code
          </Typography>
          <Typography color="textSecondary">
            Generate a temporary code and use it to establish a session on
            another (hypothetically untrusted) device without going through the
            WCA website. This strategy is useful for scoretaking on an unknown
            machine, as you don't have to type any credentials on that machine,
            just the temporary code.
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={() => generateOneTimeCode()}
          >
            Generate
          </Button>
        </Grid>
      </Grid>
      <CodeDialog
        oneTimeCode={oneTimeCode}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

export default OneTimeCode;
