import React, { useState } from 'react';
import gql from 'graphql-tag';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add qualifying competitor</DialogTitle>
      <DialogContent>
        <CustomQuery
          query={MISSING_QUALIFYING_QUERY}
          variables={{ competitionId, roundId }}
        >
          {({
            data: {
              round: {
                missingQualifying: { qualifying, excess },
              },
            },
          }) =>
            qualifying.length > 0 ? (
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <PersonSelect
                    persons={qualifying}
                    value={selectedCompetitor}
                    onChange={setSelectedCompetitor}
                    TextFieldProps={{ autoFocus: true, fullWidth: true }}
                  />
                </Grid>
                {excess.length > 0 && (
                  <Grid item>
                    <Typography color="error">
                      {`This will also remove the following competitors from this round: `}
                      <span style={{ fontWeight: 500 }}>
                        {excess.map(person => person.name).join(', ')}
                      </span>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <DialogContentText>{`No one else qualifies to this round.`}</DialogContentText>
            )
          }
        </CustomQuery>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <CustomMutation
          mutation={ADD_COMPETITOR_MUTATION}
          variables={{
            competitionId,
            roundId,
            competitorId: selectedCompetitor && selectedCompetitor.id,
          }}
          onCompleted={handleClose}
        >
          {(addCompetitor, { loading }) => (
            <Button
              onClick={addCompetitor}
              color="primary"
              disabled={!selectedCompetitor || loading}
            >
              Confirm
            </Button>
          )}
        </CustomMutation>
      </DialogActions>
    </Dialog>
  );
};

export default AddCompetitorDialog;
