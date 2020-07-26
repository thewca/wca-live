import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Home from '../Home/Home';
import Competition from '../Competition/Competition';
import Admin from '../admin/Admin/Admin';
import AdminCompetition from '../admin/AdminCompetition/AdminCompetition';

function Navigation() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/admin" component={Admin} />
      <Route path="/admin/competitions/:id" component={AdminCompetition} />
      <Route path="/competitions/:id" component={Competition} />
      <Redirect to="/" />
    </Switch>
  );
}

export default Navigation;
