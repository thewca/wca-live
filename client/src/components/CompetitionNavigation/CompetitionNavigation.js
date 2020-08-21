import React from 'react';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import CompetitionHome from '../CompetitionHome/CompetitionHome';
import Round from '../Round/Round';
import Competitors from '../Competitors/Competitors';
import Competitor from '../Competitor/Competitor';
import Podiums from '../Podiums/Podiums';
import Error from '../Error/Error';
import CompetitionLayout from './CompetitionLayout';
import Loading from '../Loading/Loading';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      shortName
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          name
          label
          open
        }
      }
      access {
        canScoretake
      }
    }
  }
`;

function CompetitionNavigation() {
  const { id } = useParams();

  const { data, error, loading } = useQuery(COMPETITION_QUERY, {
    variables: { id: id },
    // Eventually update rounds data (open, label).
    pollInterval: 60 * 1000,
  });

  if (error) return <Error error={error} />;

  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  const competition = data ? data.competition : null;

  return (
    <CompetitionLayout competition={competition}>
      {loading && <Loading />}
      <Switch>
        <Route
          exact
          path="/competitions/:competitionId"
          component={CompetitionHome}
        />
        <Route
          path="/competitions/:competitionId/rounds/:roundId"
          component={Round}
        />
        <Route
          exact
          path="/competitions/:competitionId/competitors"
          component={Competitors}
        />
        <Route
          exact
          path="/competitions/:competitionId/competitors/:competitorId"
          component={Competitor}
        />
        <Route
          exact
          path="/competitions/:competitionId/podiums"
          component={Podiums}
        />
        <Redirect to={`/competitions/${id}`} />
      </Switch>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
