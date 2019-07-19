import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import Loading from '../Loading/Loading';
import ResultsTable from '../ResultsTable/ResultsTable';

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

const Round = ({ match }) => {
  const { competitionId, roundId } = match.params;
  return (
    <Query query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { round } = data;
        return (
          <div>
            <Typography variant="h5" style={{ marginBottom: 16 }}>
              {round.event.name} - {round.name}
            </Typography>
            <ResultsTable
              results={round.results}
              format={round.format}
              eventId={round.event.id}
              displayCountry={true}
              displayId={false}
            />
          </div>
        );
      }}
    </Query>
  )
};

export default Round;
