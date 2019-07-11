import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

import ResultForm from '../ResultForm/ResultForm';
import ResultsTable from '../ResultsTable/ResultsTable';

const ROUND_QUERY = gql`
  query RoundQuery($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      id
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
                      onSubmit={result => setResult({ variables: { result } })}
                    />
                  )}
                </Mutation>
              </Grid>
              <Grid item md={9}>
                <ResultsTable results={round.results} />
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Query>
  )
};

export default AdminRound;
