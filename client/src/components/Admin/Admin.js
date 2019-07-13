import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Switch, Route, Redirect } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AdminCompetitionList from './AdminCompetitionList/AdminCompetitionList';
import AdminCompetition from './AdminCompetition/AdminCompetition';
import AdminRound from './AdminRound/AdminRound';

const USER_QUERY = gql`
  query User {
    me {
      id
      name
      avatar {
        thumbUrl
      }
    }
  }
`;

const Admin = () => {
  return (
    <Query query={USER_QUERY}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <LinearProgress />;
        const { me } = data;
        if (!me) {
          return (
            <Grid container justify="center" alignItems="center" style={{ height: '100vh'}}>
              <Grid item>
                <Button
                  size="large"
                  variant="outlined"
                  color="primary"
                  href="/oauth/sign-in"
                >
                  Sign in
                </Button>
              </Grid>
            </Grid>
          );
        } else {
          return (
            <div>
              <AppBar position="static">
                <Toolbar variant="dense">
                  <Avatar src={me.avatar.thumbUrl} style={{ marginRight: 16 }} />
                  <Typography>{me.name}</Typography>
                  <div style={{ flexGrow: 1 }} />
                  <Button color="inherit">
                    Sign out
                  </Button>
                </Toolbar>
              </AppBar>
              <Switch>
                <Route exact path="/admin/competitions" component={AdminCompetitionList} />
                <Route exact path="/admin/competitions/:id" component={AdminCompetition} />
                <Route exact path="/admin/competitions/:competitionId/rounds/:roundId" component={AdminRound} />
                <Redirect to="/admin/competitions" />
              </Switch>
            </div>
          );
        }
      }}
    </Query>
  )
};

export default Admin;
