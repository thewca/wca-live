import React from 'react';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
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
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const Round = ({ match }) => {
  const { competitionId, roundId } = match.params;
  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round } }) => (
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
            competitionId={competitionId}
          />
        </div>
      )}
    </CustomQuery>
  );
};

export default Round;
