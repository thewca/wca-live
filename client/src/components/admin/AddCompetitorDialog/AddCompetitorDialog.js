import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client';
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
import { RESULTS_UPDATE_FRAGMENT } from '../../../logic/graphql-fragments';

const MISSING_QUALIFYING_QUERY = gql`
  query MissingQualifying($competitionId: ID!, $roundId: String!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      _id
      id
      missingQualifying {
        qualifying {
          _id
          id
          name
        }
        excess {
          _id
          id
          name
        }
      }
    }
  }
`;

const ADD_COMPETITOR_MUTATION = gql`
  mutation AddCompetitor(
    $competitionId: ID!
    $roundId: String!
    $competitorId: Int!
  ) {
    addCompetitor(
      competitionId: $competitionId
      roundId: $roundId
      competitorId: $competitorId
    ) {
      _id
      id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
`;

const AddCompetitorDialog = ({ open, onClose, competitionId, roundId }) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const handleClose = () => {
    setSelectedCompetitor(null);
    onClose();
  };

  const { data, loading, error } = useQuery(MISSING_QUALIFYING_QUERY, {
    variables: { competitionId, roundId },
  });

  const [
    addCompetitor,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(ADD_COMPETITOR_MUTATION, {
    variables: {
      competitionId,
      roundId,
      competitorId: selectedCompetitor && selectedCompetitor.id,
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
          (data.round.missingQualifying.qualifying.length > 0 ? (
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <PersonSelect
                  persons={data.round.missingQualifying.qualifying}
                  value={selectedCompetitor}
                  onChange={setSelectedCompetitor}
                  TextFieldProps={{ autoFocus: true, fullWidth: true }}
                />
              </Grid>
              {data.round.missingQualifying.excess.length > 0 && (
                <Grid item>
                  <Typography color="error">
                    {`This will also remove the following competitors from this round: `}
                    <span style={{ fontWeight: 500 }}>
                      {data.round.missingQualifying.excess
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
          onClick={addCompetitor}
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
