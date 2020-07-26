import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { Button } from '@material-ui/core';
import { useConfirm } from 'material-ui-confirm';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';

const CLEAR_ROUND_MUTATION = gql`
  mutation ClearRound($input: ClearRoundInput!) {
    clearRound(input: $input) {
      round {
        id
        open
      }
    }
  }
`;

function ClearRoundButton({ round, competitionEvent }) {
  const confirm = useConfirm();

  const [clearRound, { loading, error }] = useMutation(CLEAR_ROUND_MUTATION, {
    variables: { input: { id: round.id } },
  });

  function handleClearRoundClick() {
    confirm({
      description: `
        This will irreversibly remove all results
        from ${competitionEvent.event.name} - ${round.name}.
      `,
    }).then(clearRound);
  }

  return (
    <>
      {error && <ErrorSnackbar error={error} />}
      <Button size="small" onClick={handleClearRoundClick} disabled={loading}>
        Clear
      </Button>
    </>
  );
}

export default ClearRoundButton;
