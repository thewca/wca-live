import React from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
import AdminEvents from './AdminEvents/AdminEvents';
import Synchronize from './Synchronize/Synchronize';
import RoundDoubleCheck from './RoundDoubleCheck/RoundDoubleCheck';
import AdminRound from './AdminRound/AdminRound';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
    }
    me {
      id
      manageableCompetitions {
        id
      }
    }
  }
`;

const AdminCompetition = ({ match, location }) => {
  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data }) => {
        const { competition, me } = data;
        const manageableByCurrentUser =
          me &&
          me.manageableCompetitions.some(({ id }) => id === competition.id);
        if (!manageableByCurrentUser) {
          return <Redirect to={`/competitions/${competition.id}`} />;
        }

        return (
          <div>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" color="inherit">
                  {competition.name}
                </Typography>
                <div style={{ flexGrow: 1 }} />
                <IconButton
                  color="inherit"
                  component={Link}
                  to={`/admin/competitions/${competition.id}`}
                >
                  <Icon>view_list</Icon>
                </IconButton>
                <IconButton
                  color="inherit"
                  component={Link}
                  to={`/admin/competitions/${competition.id}/sync`}
                >
                  <Icon>sync</Icon>
                </IconButton>
                <IconButton
                  color="inherit"
                  component={Link}
                  to={location.pathname.replace(/^\/admin/, '')}
                >
                  <Icon>remove_red_eye</Icon>
                </IconButton>
                <IconButton color="inherit" component={Link} to="/admin">
                  <Icon>account_circle</Icon>
                </IconButton>
              </Toolbar>
            </AppBar>
            <Switch>
              <Route
                exact
                path="/admin/competitions/:competitionId"
                component={AdminEvents}
              />
              <Route
                exact
                path="/admin/competitions/:competitionId/sync"
                component={Synchronize}
              />
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
              <Redirect to={`/admin/competitions/${competition.id}`} />
            </Switch>
          </div>
        );
      }}
    </CustomQuery>
  );
};

export default AdminCompetition;
