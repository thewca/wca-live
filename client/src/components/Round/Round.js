import React, { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
import ResultsTable from '../ResultsTable/ResultsTable';
import ResultDialog from '../ResultDialog/ResultDialog';
import { RESULTS_UPDATE_FRAGMENT } from '../../logic/graphql-fragments';

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
        advancable
        attempts
        best
        average
        person {
          id
          name
          country {
            name
          }
        }
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const ROUND_UPDATE_SUBSCRIPTION = gql`
  subscription RoundUpdate($competitionId: ID!, $roundId: ID!) {
    roundUpdate(competitionId: $competitionId, roundId: $roundId) {
      id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
`;

const Round = ({ match }) => {
  const { competitionId, roundId } = match.params;
  const [selectedResult, setSelectedResult] = useState(null);

  const handleResultClick = useCallback((result, event) => {
    setSelectedResult(result);
  }, []);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round }, subscribeToMore }) => {
        subscribeToMore({
          document: ROUND_UPDATE_SUBSCRIPTION,
          variables: { competitionId, roundId },
        });

        return (
          <div>
            <Typography variant="h5" gutterBottom>
              {round.event.name} - {round.name}
            </Typography>
            <ResultsTable
              results={round.results}
              format={round.format}
              eventId={round.event.id}
              competitionId={competitionId}
              onResultClick={handleResultClick}
            />
            <Hidden mdUp>
              <ResultDialog
                result={selectedResult}
                format={round.format}
                eventId={round.event.id}
                competitionId={competitionId}
                onClose={() => setSelectedResult(null)}
              />
            </Hidden>
          </div>
        );
      }}
    </CustomQuery>
  );
};

export default Round;
