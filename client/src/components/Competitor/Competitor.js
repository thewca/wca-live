import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import Loading from '../Loading/Loading';
import FlagIcon from '../FlagIcon/FlagIcon';
import CompetitorResultsTable from '../CompetitorResultsTable/CompetitorResultsTable';
import { groupBy } from '../../logic/utils';

const COMPETITOR_QUERY = gql`
  query Competitor($competitionId: ID!, $competitorId: ID!) {
    competitor(competitionId: $competitionId, competitorId: $competitorId) {
      id
      name
      country {
        iso2
      }
      results {
        ranking
        advancable
        attempts
        recordTags {
          single
          average
        }
        round {
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
        }
      }
    }
  }
`;

const Competitor = ({ match }) => {
  const { competitionId, competitorId } = match.params;
  return (
    <Query query={COMPETITOR_QUERY} variables={{ competitionId, competitorId }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { competitor } = data;
        const resultsByEvent = groupBy(
          competitor.results,
          result => result.round.event.name
        );
        return (
          <div>
            <Typography variant="h5" style={{ marginBottom: 16 }}>
              {competitor.name}{' '}
              <FlagIcon code={competitor.country.iso2.toLowerCase()} />
            </Typography>
            {Object.entries(resultsByEvent).map(([eventName, results]) => (
              <div style={{ marginBottom: 32 }} key={eventName}>
                <Typography variant="subtitle1">{eventName}</Typography>
                <CompetitorResultsTable
                  results={results}
                  competitionId={competitionId}
                />
              </div>
            ))}
          </div>
        );
      }}
    </Query>
  );
};

export default Competitor;
