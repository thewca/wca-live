import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
import AdminEvents from './AdminEvents/AdminEvents';
import Synchronize from './Synchronize/Synchronize';
import AdminRound from './AdminRound/AdminRound';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
    }
  }
`;

const AdminCompetition = ({ match }) => {
  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data: { competition } }) => (
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
              <IconButton color="inherit">
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
              path="/admin/competitions/:competitionId/rounds/:roundId"
              component={AdminRound}
            />
          </Switch>
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminCompetition;
