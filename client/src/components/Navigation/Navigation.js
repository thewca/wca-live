import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Admin from '../admin/Admin/Admin';
import AdminCompetition from '../admin/AdminCompetition/AdminCompetition';
import Competition from '../Competition/Competition';
import Home from '../Home/Home';
import Layout from '../Layout/Layout';
import SignIn from '../SignIn/SignIn';
import About from '../About/About';

function Navigation() {
  return (
    <Switch>
      <Route exact path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route exact path="/sign-in">
        <Layout>
          <SignIn />
        </Layout>
      </Route>
      <Route exact path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>
      <Route exact path="/admin">
        <Layout>
          <Admin />
        </Layout>
      </Route>
      <Route path="/admin/competitions/:id" component={AdminCompetition} />
      <Route path="/competitions/:id" component={Competition} />
      <Redirect to="/" />
    </Switch>
  );
}

export default Navigation;
