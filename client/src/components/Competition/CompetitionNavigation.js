import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import CompetitionHome from '../CompetitionHome/CompetitionHome';
import Round from '../Round/Round';
import Competitors from '../Competitors/Competitors';
import Competitor from '../Competitor/Competitor';
import Podiums from '../Podiums/Podiums';

function CompetitionNavigation({ competitionId }) {
  return (
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
      <Redirect to={`/competitions/${competitionId}`} />
    </Switch>
  );
}

export default CompetitionNavigation;
