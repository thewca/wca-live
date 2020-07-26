import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import AdminCompetitionEvents from '../AdminCompetitionEvents/AdminCompetitionEvents';
import Synchronization from '../Synchronization/Synchronization';
import AdminSettings from '../AdminSettings/AdminSettings';
import RoundDoubleCheck from '../RoundDoubleCheck/RoundDoubleCheck';
import AdminRound from '../AdminRound/AdminRound';
import AdminCompetitors from '../AdminCompetitors/AdminCompetitors';

function AdminCompetitionNavigation({ competition }) {
  return (
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
  );
}

export default AdminCompetitionNavigation;
