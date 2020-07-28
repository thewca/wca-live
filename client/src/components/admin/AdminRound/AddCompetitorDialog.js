import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
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
import PersonSelect from '../PersonSelect/PersonSelect';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

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
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

function AddCompetitorDialog({ open, onClose, roundId }) {
  const apolloErrorHandler = useApolloErrorHandler();

  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const [
    getAdvancementCandidates,
    { data, loading, error },
  ] = useLazyQuery(ADVANCEMENT_CANDIDATES_QUERY, { variables: { roundId } });

  useEffect(() => {
    if (open) {
      getAdvancementCandidates();
      setSelectedCompetitor(null);
    }
  }, [open, getAdvancementCandidates]);

  const [addCompetitorToRound, { loading: mutationLoading }] = useMutation(
    ADD_PERSON_TO_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personId: selectedCompetitor && selectedCompetitor.id,
        },
      },
      onCompleted: handleClose,
      onError: apolloErrorHandler,
    }
  );

  function handleClose() {
    setSelectedCompetitor(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {loading && <Loading />}
      <DialogTitle>Add competitor</DialogTitle>
      <DialogContent>
        {error && <Error error={error} />}
        {data &&
          (data.round.advancementCandidates.qualifying.length > 0 ? (
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <DialogContentText>
                  You can add any competitor who qualifies for this round. This
                  is a way to quickly register someone for the first round
                  without going to the WCA website or to bring back a competitor
                  you have quit before.
                </DialogContentText>
              </Grid>
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
      </DialogActions>
    </Dialog>
  );
}

export default AddCompetitorDialog;
