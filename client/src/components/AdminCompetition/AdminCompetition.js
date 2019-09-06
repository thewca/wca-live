import React from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

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

const useStyles = makeStyles(theme => ({
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  admin: {
    marginLeft: theme.spacing(1),
  },
  grow: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing(3),
  },
}));

const AdminCompetition = ({ match, location }) => {
  const classes = useStyles();
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
            <AppBar position="static" className={classes.appBar}>
              <Toolbar>
                <Typography variant="h6" color="inherit">
                  {competition.name}
                </Typography>
                <Typography variant="overline" className={classes.admin}>
                  Admin
                </Typography>
                <div className={classes.grow} />
                <Tooltip title="Events">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin/competitions/${competition.id}`}
                  >
                    <Icon>view_list</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Synchronization">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin/competitions/${competition.id}/sync`}
                  >
                    <Icon>sync</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Public view">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={location.pathname.replace(/^\/admin/, '')}
                  >
                    <Icon>remove_red_eye</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="My competitions">
                  <IconButton color="inherit" component={Link} to="/admin">
                    <Icon>account_circle</Icon>
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </AppBar>
            <div className={classes.content}>
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
          </div>
        );
      }}
    </CustomQuery>
  );
};

export default AdminCompetition;
