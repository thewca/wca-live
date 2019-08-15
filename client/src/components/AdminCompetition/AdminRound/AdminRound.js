import React, { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../../CustomQuery/CustomQuery';
import ResultForm from '../ResultForm/ResultForm';
import AdminResultsTable from '../AdminResultsTable/AdminResultsTable';
import ResultMenu from '../ResultMenu/ResultMenu';
import { RESULTS_UPDATE_FRAGMENT } from '../../../logic/graphql-fragments';
import { toInt } from '../../../logic/utils';

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
  mutation SetResult(
    $competitionId: ID!
    $roundId: ID!
    $result: ResultInput!
  ) {
    setResult(
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
  const [resultMenuProps, setResultMenuProps] = useState({});

  const handleResultClick = useCallback((result, event) => {
    setResultMenuProps({
      position: { left: event.clientX, top: event.clientY },
      result,
    });
  }, []);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round } }) => (
        <div style={{ padding: 24 }}>
          <Grid container direction="row" spacing={2}>
            <Grid item md={3}>
              <ResultForm
                result={editedResult}
                onPersonIdChange={id => {
                  setEditedResult(
                    round.results.find(result => toInt(result.person.id) === id)
                  );
                }}
                format={round.format}
                eventId={round.event.id}
                timeLimit={round.timeLimit}
                cutoff={round.cutoff}
                competitionId={competitionId}
                roundId={roundId}
                setResultMutation={SET_RESULT_MUTATION}
              />
            </Grid>
            <Grid item md={9}>
              <Typography
                variant="h5"
                align="center"
                style={{ marginBottom: 16 }}
              >
                {round.event.name} - {round.name}
              </Typography>
              <AdminResultsTable
                results={round.results}
                format={round.format}
                eventId={round.event.id}
                competitionId={competitionId}
                onResultClick={handleResultClick}
              />
            </Grid>
          </Grid>
          <ResultMenu
            {...resultMenuProps}
            onClose={() => setResultMenuProps({})}
            competitionId={competitionId}
            roundId={roundId}
            setResultMutation={SET_RESULT_MUTATION}
          />
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminRound;
