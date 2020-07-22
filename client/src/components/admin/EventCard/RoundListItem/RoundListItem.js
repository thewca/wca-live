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
  mutation OpenRound($competitionId: ID!, $roundId: String!) {
    openRound(competitionId: $competitionId, roundId: $roundId) {
      _id
      open
    }
  }
`;

const CLEAR_ROUND_MUTATION = gql`
  mutation ClearRound($competitionId: ID!, $roundId: String!) {
    clearRound(competitionId: $competitionId, roundId: $roundId) {
      _id
      open
    }
  }
`;

const roundOpenable = (round) => {
  return !round.open && (!round.previous || round.previous.open);
};

const roundClearable = (round) => {
  return round.open && (!round.next || !round.next.open);
};

const RoundListItem = ({ event, round, competitionId }) => {
  const confirm = useConfirm();
  const [openRound, { loading: openLoading, error: openError }] = useMutation(
    OPEN_ROUND_MUTATION,
    {
      variables: { competitionId, roundId: round.id },
    }
  );

  const [
    clearRound,
    { loading: clearLoading, error: clearError },
  ] = useMutation(CLEAR_ROUND_MUTATION, {
    variables: { competitionId, roundId: round.id },
  });

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
        {roundOpenable(round) && (
          <Button
            size="small"
            onClick={() => {
              if (round.previous && !round.previous.finished) {
                confirm({
                  description: `
                    There are some missing results in the previous round.
                    Opening this round will permanently remove them.
                  `,
                }).then(openRound);
              } else {
                openRound();
              }
            }}
            disabled={openLoading}
          >
            Open
          </Button>
        )}
        {openError && <ErrorSnackbar error={openError} />}
        {roundClearable(round) && (
          <Button
            size="small"
            onClick={() => {
              confirm({
                description: `
                  This will irreversibly remove all results
                  from ${event.name} - ${round.name}.
                `,
              }).then(clearRound);
            }}
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
