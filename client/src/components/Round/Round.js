import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';

import CustomQuery from '../CustomQuery/CustomQuery';
import RoundProjector from '../RoundProjector/RoundProjector';
import RoundView from '../RoundView/RoundView';
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
            iso2
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
  const [subscribed, setSubscribed] = useState(false);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round }, subscribeToMore }) => {
        if (!subscribed) {
          subscribeToMore({
            document: ROUND_UPDATE_SUBSCRIPTION,
            variables: { competitionId, roundId },
          });
          setSubscribed(true);
        }

        return (
          <Switch>
            <Route
              exact
              path={`/competitions/${competitionId}/rounds/${round.id}/projector`}
              render={() => (
                <RoundProjector round={round} competitionId={competitionId} />
              )}
            />
            <Route
              exact
              path={`/competitions/${competitionId}/rounds/${round.id}`}
              render={() => (
                <RoundView round={round} competitionId={competitionId} />
              )}
            />
            <Redirect
              to={`/competitions/${competitionId}/rounds/${round.id}`}
            />
          </Switch>
        );
      }}
    </CustomQuery>
  );
};

export default Round;
