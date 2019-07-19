import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Admin from '../Admin/Admin';
import Competition from '../Competition/Competition';

const Navigation = () => {
  return (
    <Switch>
      <Route exact path="/" render={() => "Homepage"} />
      <Route path="/admin" component={Admin} />
      <Route path="/competitions/:id" component={Competition} />
      <Redirect to="/" />
    </Switch>
  )
};

export default Navigation;
