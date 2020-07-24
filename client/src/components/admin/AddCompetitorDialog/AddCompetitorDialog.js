import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import PersonSelect from '../PersonSelect/PersonSelect';
import { RESULTS_UPDATE_FRAGMENT } from '../../../lib/graphql-fragments';

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
          ranking
          advancing
          attempts {
            result
          }
          best
          average
          person {
            id
            registrantId
            name
          }
          singleRecordTag
          averageRecordTag
        }
      }
    }
  }
`;

const AddCompetitorDialog = ({ open, onClose, competitionId, roundId }) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const handleClose = () => {
    setSelectedCompetitor(null);
    onClose();
  };

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

  if (error) return <ErrorSnackbar />;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {loading && <Loading />}
      <DialogTitle>Add qualifying competitor</DialogTitle>
      <DialogContent>
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
};

export default AddCompetitorDialog;
