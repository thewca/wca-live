import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CheckIcon from '@material-ui/icons/Check';
import PrintIcon from '@material-ui/icons/Print';

import CustomQuery from '../../CustomQuery/CustomQuery';
import ResultForm from '../ResultForm/ResultForm';
import AdminResultsTable from '../AdminResultsTable/AdminResultsTable';
import ResultMenu from '../ResultMenu/ResultMenu';
import AddCompetitorDialog from '../AddCompetitorDialog/AddCompetitorDialog';
import { RESULTS_UPDATE_FRAGMENT } from '../../../logic/graphql-fragments';

const ROUND_QUERY = gql`
  query Round($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      id
      name
      event {
        id
        name
      }
      format {
        solveCount
        sortBy
      }
      timeLimit {
        centiseconds
        cumulativeRoundIds
      }
      cutoff {
        numberOfAttempts
        attemptResult
      }
      results {
        ranking
        advancable
        attempts
        best
        average
        person {
          id
          name
        }
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const SET_RESULT_MUTATION = gql`
  mutation UpdateResult(
    $competitionId: ID!
    $roundId: ID!
    $result: ResultInput!
  ) {
    updateResult(
      competitionId: $competitionId
      roundId: $roundId
      result: $result
    ) {
      id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
`;

const AdminRound = ({ match }) => {
  const { competitionId, roundId } = match.params;
  const [editedResult, setEditedResult] = useState(null);
  const [resultMenuProps, updateResultMenuProps] = useState({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleResultClick = useCallback((result, event) => {
    updateResultMenuProps({
      position: { left: event.clientX, top: event.clientY },
      result,
    });
  }, []);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round } }) => (
        <div>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={12} md={3}>
              <ResultForm
                result={editedResult}
                results={round.results}
                onResultChange={result => {
                  setEditedResult(result);
                }}
                format={round.format}
                eventId={round.event.id}
                timeLimit={round.timeLimit}
                cutoff={round.cutoff}
                competitionId={competitionId}
                roundId={roundId}
                updateResultMutation={SET_RESULT_MUTATION}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h5" align="center">
                    {round.event.name} - {round.name}
                  </Typography>
                </Grid>
                <Grid item style={{ flexGrow: 1 }} />
                <Grid item>
                  <Tooltip title="PDF" placement="top">
                    <IconButton
                      component="a"
                      target="_blank"
                      href={`/pdfs/competitions/${competitionId}/rounds/${round.id}`}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add competitor" placement="top">
                    <IconButton onClick={() => setAddDialogOpen(true)}>
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Double-check" placement="top">
                    <IconButton
                      component={Link}
                      to={`${match.url}/doublecheck`}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <div style={{ overflowX: 'auto', paddingRight: 4 }}>
                <AdminResultsTable
                  results={round.results}
                  format={round.format}
                  eventId={round.event.id}
                  competitionId={competitionId}
                  onResultClick={handleResultClick}
                />
              </div>
            </Grid>
          </Grid>
          <ResultMenu
            {...resultMenuProps}
            onClose={() => updateResultMenuProps({})}
            onEditClick={() => setEditedResult(resultMenuProps.result)}
            competitionId={competitionId}
            roundId={roundId}
            updateResultMutation={SET_RESULT_MUTATION}
          />
          <AddCompetitorDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            competitionId={competitionId}
            roundId={roundId}
          />
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminRound;
