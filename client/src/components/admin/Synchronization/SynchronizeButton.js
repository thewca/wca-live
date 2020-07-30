import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { Button } from '@material-ui/core';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

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
  const apolloErrorHandler = useApolloErrorHandler();

  const [synchronize, { loading }] = useMutation(SYNCHRONIZE_MUTATION, {
    variables: { input: { id: competitionId } },
    onError: apolloErrorHandler,
  });

  return (
    <Button
      variant="contained"
      disableElevation
      color="primary"
      size="large"
      onClick={synchronize}
      disabled={loading}
    >
      Synchronize
    </Button>
  );
}

export default SynchronizeButton;
