import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ResultForm from '../ResultForm/ResultForm';
import ResultsTable from '../ResultsTable/ResultsTable';

const ROUND_QUERY = gql`
  query Round($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      id
      format {
        solveCount
        sortBy
      }
      timeLimit {
        centiseconds
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
          country {
            name
          }
        }
        attempts
        advancable
      }
    }
  }
`;

const SET_RESULT_MUTATION = gql`
  mutation SetResult($competitionId: ID!, $roundId: ID!, $result: ResultInput!) {
    setResult(competitionId: $competitionId, roundId: $roundId, result: $result) {
      id
      results {
        ranking
        person {
          id
        }
        attempts
        advancable
      }
    }
  }
`;

const FINISH_ROUND_MUTATION = gql`
  mutation FinishRound($competitionId: ID!, $roundId: ID!) {
    finishRound(competitionId: $competitionId, roundId: $roundId) {
      id
      results {
        advancable
      }
    }
  }
`;

const AdminRound = ({ match }) => {
  const { competitionId, roundId } = match.params;
  return (
    <Query query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <LinearProgress />;
        const { round } = data;
        return (
          <div style={{ padding: 24 }}>
            <Typography variant="h5">{round.id}</Typography>
            <Grid container direction="row" spacing={2}>
              <Grid item md={3}>
                <Mutation
                  mutation={SET_RESULT_MUTATION}
                  variables={{ competitionId, roundId }}
                >
                  {(setResult) => (
                    <ResultForm
                      results={round.results}
                      format={round.format}
                      eventId={round.id.split('-')[0] /* TODO: get eventId from query instead */}
                      timeLimit={round.timeLimit}
                      cutoff={round.cutoff}
                      onSubmit={result => setResult({ variables: { result } })}
                    />
                  )}
                </Mutation>
                <Mutation
                  mutation={FINISH_ROUND_MUTATION}
                  variables={{ competitionId, roundId }}
                >
                  {(finishRound, { loading }) => (
                    <Button
                      variant="outlined"
                      onClick={finishRound}
                      disabled={loading}
                      style={{ marginTop: 64 }}
                      tabIndex="-1"
                    >
                      Finish round
                    </Button>
                  )}
                </Mutation>
              </Grid>
              <Grid item md={9}>
                <ResultsTable
                  results={round.results}
                  format={round.format}
                  eventId={round.id.split('-')[0] /* TODO: get eventId from query instead */}
                />
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Query>
  )
};

export default AdminRound;
