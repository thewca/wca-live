import React from 'react';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import AdminCompetitionEvents from '../AdminCompetitionEvents/AdminCompetitionEvents';
import Synchronization from '../Synchronization/Synchronization';
import AdminSettings from '../AdminSettings/AdminSettings';
import RoundDoubleCheck from '../RoundDoubleCheck/RoundDoubleCheck';
import AdminRound from '../AdminRound/AdminRound';
import AdminCompetitors from '../AdminCompetitors/AdminCompetitors';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import AdminCompetitionLayout from './AdminCompetitionLayout';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      shortName
      access {
        canManage
        canScoretake
      }
    }
  }
`;

function AdminCompetitionNavigation() {
  const { id } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  if (!competition.access.canScoretake) return <Redirect to="/sign-in" />;

  return (
    <AdminCompetitionLayout competition={competition}>
      <Switch>
        <Route
          exact
          path="/admin/competitions/:competitionId"
          component={AdminCompetitionEvents}
        />
        <Route
          exact
          path="/admin/competitions/:competitionId/sync"
          component={Synchronization}
        />
        {competition.access.canManage && (
          <Route
            exact
            path="/admin/competitions/:competitionId/settings"
            component={AdminSettings}
          />
        )}
        <Route
          exact
          path="/admin/competitions/:competitionId/rounds/:roundId/doublecheck"
          component={RoundDoubleCheck}
        />
        <Route
          exact
          path="/admin/competitions/:competitionId/rounds/:roundId"
          component={AdminRound}
        />
        <Route
          exact
          path="/admin/competitions/:competitionId/competitors"
          component={AdminCompetitors}
        />
        <Redirect to={`/admin/competitions/${competition.id}`} />
      </Switch>
    </AdminCompetitionLayout>
  );
}

export default AdminCompetitionNavigation;
