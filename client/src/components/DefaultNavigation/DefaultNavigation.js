import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Switch, Route, Redirect } from 'react-router-dom';
import Admin from '../admin/Admin/Admin';
import Home from '../Home/Home';
import DefaultLayout from './DefaultLayout';
import SignIn from '../SignIn/SignIn';
import About from '../About/About';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      name
      avatar {
        thumbUrl
      }
    }
  }
`;

function DefaultNavigation() {
  const { data, error, loading } = useQuery(CURRENT_USER_QUERY);

  if (error) return <Error error={error} />;

  const loaded = !loading || !!data;
  const currentUser = data ? data.currentUser : null;

  return (
    <DefaultLayout currentUser={currentUser} loaded={loaded}>
      {loading && <Loading />}
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/sign-in">
          <SignIn />
        </Route>
        <Route exact path="/about">
          <About />
        </Route>
        {currentUser && (
          <Route exact path="/admin">
            <Admin />
          </Route>
        )}
        {/* Wait for data before redirecting as the user routes are rendered conditionally. */}
        {loaded && <Redirect to="/" />}
      </Switch>
    </DefaultLayout>
  );
}

export default DefaultNavigation;
