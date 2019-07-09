import React from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';

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
