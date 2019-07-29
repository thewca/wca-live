import React from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';
import ResultForm from '../ResultForm/ResultForm';
import AdminResultsTable from '../AdminResultsTable/AdminResultsTable';

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
        person {
          id
          name
        }
        attempts
        advancable
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
      results {
        ranking
        person {
          id
        }
        attempts
        advancable
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const AdminRound = ({ match }) => {
  const { competitionId, roundId } = match.params;
  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round } }) => (
        <div style={{ padding: 24 }}>
          <Grid container direction="row" spacing={2}>
            <Grid item md={3}>
              <CustomMutation
                mutation={SET_RESULT_MUTATION}
                variables={{ competitionId, roundId }}
              >
                {setResult => (
                  <ResultForm
                    results={round.results}
                    format={round.format}
                    eventId={round.event.id}
                    timeLimit={round.timeLimit}
                    cutoff={round.cutoff}
                    onSubmit={result => setResult({ variables: { result } })}
                  />
                )}
              </CustomMutation>
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
              />
            </Grid>
          </Grid>
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminRound;
