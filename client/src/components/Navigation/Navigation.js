import React from 'react';
import { Switch, Route } from 'react-router-dom';
import AdminCompetitionNavigation from '../admin/AdminCompetitionNavigation/AdminCompetitionNavigation';
import CompetitionNavigation from '../CompetitionNavigation/CompetitionNavigation';
import DefaultNavigation from '../DefaultNavigation/DefaultNavigation';

function Navigation() {
  return (
    <Switch>
      <Route path="/competitions/:id" component={CompetitionNavigation} />
      <Route
        path="/admin/competitions/:id"
        component={AdminCompetitionNavigation}
      />
      <Route path="/" component={DefaultNavigation} />
    </Switch>
  );
}

export default Navigation;
