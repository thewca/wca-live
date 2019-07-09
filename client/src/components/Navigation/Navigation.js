import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Admin from '../Admin/Admin';

const Navigation = () => {
  return (
    <Switch>
      <Route exact path="/" render={() => "Homepage"} />
      <Route path="/admin" component={Admin} />
      <Redirect to="/" />
    </Switch>
  )
};

export default Navigation;
