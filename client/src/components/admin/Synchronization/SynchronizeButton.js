import React from 'react';
import { gql, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';

const SYNCHRONIZE_MUTATION = gql`
  mutation Synchronize($input: SynchronizeInput!) {
    synchronizeCompetition(input: $input) {
      competition {
        id
        synchronizedAt
      }
    }
  }
`;

function SynchronizeButton({ competitionId }) {
  const [synchronize, { loading, error }] = useMutation(SYNCHRONIZE_MUTATION, {
    variables: { input: { id: competitionId } },
  });

  return (
    <>
      {error && <ErrorSnackbar error={error} />}
      <Button
        variant="outlined"
        color="primary"
        size="large"
        onClick={synchronize}
        disabled={loading}
      >
        Synchronize
      </Button>
    </>
  );
}

export default SynchronizeButton;
