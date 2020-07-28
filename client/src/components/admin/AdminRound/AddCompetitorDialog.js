import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import PersonSelect from '../PersonSelect/PersonSelect';
import { ROUND_RESULT_FRAGMENT } from './fragments';

const ADVANCEMENT_CANDIDATES_QUERY = gql`
  query AdvancementCandidates($roundId: ID!) {
    round(id: $roundId) {
      id
      advancementCandidates {
        qualifying {
          id
          name
          registrantId
        }
        revocable {
          id
          name
          registrantId
        }
      }
    }
  }
`;

const ADD_PERSON_TO_ROUND_MUTATION = gql`
  mutation AddPersonToRound($input: AddPersonToRoundInput!) {
    addPersonToRound(input: $input) {
      round {
        id
        results {
          id
          ...roundResult
        }
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

function AddCompetitorDialog({ open, onClose, roundId }) {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const { data, loading, error } = useQuery(ADVANCEMENT_CANDIDATES_QUERY, {
    variables: { roundId },
  });

  const [
    addCompetitorToRound,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(ADD_PERSON_TO_ROUND_MUTATION, {
    variables: {
      input: {
        roundId,
        personId: selectedCompetitor && selectedCompetitor.id,
      },
    },
    onCompleted: handleClose,
  });

  function handleClose() {
    setSelectedCompetitor(null);
    onClose();
  }

  // TODO: add description of what this does

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {loading && <Loading />}
      <DialogTitle>Add qualifying competitor</DialogTitle>
      <DialogContent>
        {error && <Error error={error} />}
        {data &&
          (data.round.advancementCandidates.qualifying.length > 0 ? (
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <PersonSelect
                  persons={data.round.advancementCandidates.qualifying}
                  value={selectedCompetitor}
                  onChange={setSelectedCompetitor}
                  TextFieldProps={{ autoFocus: true, fullWidth: true }}
                />
              </Grid>
              {data.round.advancementCandidates.revocable.length > 0 && (
                <Grid item>
                  <Typography color="error">
                    {`This will also remove the following competitors from this round: `}
                    <span style={{ fontWeight: 500 }}>
                      {data.round.advancementCandidates.revocable
                        .map((person) => person.name)
                        .join(', ')}
                    </span>
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <DialogContentText>{`No one else qualifies to this round.`}</DialogContentText>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={addCompetitorToRound}
          color="primary"
          disabled={!selectedCompetitor || mutationLoading}
        >
          Confirm
        </Button>
        {mutationError && <ErrorSnackbar error={mutationError} />}
      </DialogActions>
    </Dialog>
  );
}

export default AddCompetitorDialog;
