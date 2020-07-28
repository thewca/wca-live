import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { Button } from '@material-ui/core';
import { useConfirm } from 'material-ui-confirm';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

const OPEN_ROUND_MUTATION = gql`
  mutation OpenRound($input: OpenRoundInput!) {
    openRound(input: $input) {
      round {
        id
        open
      }
    }
  }
`;

function OpenRoundButton({ round, competitionEvent }) {
  const confirm = useConfirm();
  const apolloErrorHandler = useApolloErrorHandler();

  const [openRound, { loading }] = useMutation(OPEN_ROUND_MUTATION, {
    variables: { input: { id: round.id } },
    onError: apolloErrorHandler,
  });

  function handleOpenRoundClick() {
    const previous = competitionEvent.rounds.find(
      (other) => other.number === round.number - 1
    );
    if (previous && !previous.finished) {
      confirm({
        description: `
          There are some missing results in the previous round.
          Opening this round will permanently remove them.
        `,
      }).then(openRound);
    } else {
      openRound();
    }
  }

  return (
    <Button size="small" onClick={handleOpenRoundClick} disabled={loading}>
      Open
    </Button>
  );
}

export default OpenRoundButton;
