import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import withConfirm from 'material-ui-confirm';

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

const roundOpenable = round => {
  return !round.open && (!round.previous || round.previous.open);
};

const roundClearable = round => {
  return round.open && (!round.next || !round.next.open);
};

const RoundListItem = ({ event, round, competitionId, confirm }) => {
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
            onClick={
              round.previous && !round.previous.finished
                ? confirm(openRound, {
                    description: `
                      There are some missing results in the previous round.
                      Opening this round will permanently remove them.
                    `,
                  })
                : openRound
            }
            disabled={openLoading}
          >
            Open
          </Button>
        )}
        {openError && <ErrorSnackbar error={openError} />}
        {roundClearable(round) && (
          <Button
            size="small"
            onClick={confirm(clearRound, {
              description: `
                This will irreversibly remove all results
                from ${event.name} - ${round.name}.
              `,
            })}
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

export default withConfirm(RoundListItem);
