import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { useConfirm } from 'material-ui-confirm';

import ErrorSnackbar from '../../../ErrorSnackbar/ErrorSnackbar';

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

const roundOpenable = (round, competitionEvent) => {
  const previous = competitionEvent.rounds.find(
    (other) => other.number === round.number - 1
  );
  return !round.open && (!previous || previous.open);
};

const roundClearable = (round, competitionEvent) => {
  const next = competitionEvent.rounds.find(
    (other) => other.number === round.number + 1
  );
  return round.open && (!next || !next.open);
};

const RoundListItem = ({ round, competitionEvent, competitionId }) => {
  const confirm = useConfirm();
  const [openRound, { loading: openLoading, error: openError }] = useMutation(
    OPEN_ROUND_MUTATION,
    {
      variables: { input: { id: round.id } },
    }
  );

  const [
    clearRound,
    { loading: clearLoading, error: clearError },
  ] = useMutation(CLEAR_ROUND_MUTATION, {
    variables: { input: { id: round.id } },
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

  function handleClearRoundClick() {
    confirm({
      description: `
        This will irreversibly remove all results
        from ${competitionEvent.event.name} - ${round.name}.
      `,
    }).then(clearRound);
  }

  return (
    <ListItem
      key={round.id}
      button
      component={Link}
      to={`/admin/competitions/${competitionId}/rounds/${round.id}`}
      disabled={!round.open}
    >
      <ListItemText primary={round.name} />
      <ListItemSecondaryAction>
        {roundOpenable(round, competitionEvent) && (
          <Button
            size="small"
            onClick={handleOpenRoundClick}
            disabled={openLoading}
          >
            Open
          </Button>
        )}
        {openError && <ErrorSnackbar error={openError} />}
        {roundClearable(round, competitionEvent) && (
          <Button
            size="small"
            onClick={handleClearRoundClick}
            disabled={clearLoading}
          >
            Clear
          </Button>
        )}
        {clearError && <ErrorSnackbar error={clearError} />}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default RoundListItem;
