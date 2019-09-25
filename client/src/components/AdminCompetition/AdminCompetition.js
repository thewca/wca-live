import React from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import SyncIcon from '@material-ui/icons/Sync';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';

import CustomQuery from '../CustomQuery/CustomQuery';
import AdminEvents from './AdminEvents/AdminEvents';
import Synchronize from './Synchronize/Synchronize';
import AdminSettings from './AdminSettings/AdminSettings';
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
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  admin: {
    marginLeft: theme.spacing(1),
  },
  grow: {
    flexGrow: 1,
  },
  content: {
    position: 'relative' /* For LinearProgress */,
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
            <AppBar position="sticky" className={classes.appBar}>
              <Toolbar>
                <Link
                  to={`/admin/competitions/${competition.id}`}
                  className={classes.titleLink}
                >
                  <Typography variant="h6" color="inherit" component="span">
                    {competition.name}
                  </Typography>
                  <Typography
                    variant="overline"
                    component="span"
                    className={classes.admin}
                  >
                    Admin
                  </Typography>
                </Link>
                <div className={classes.grow} />
                <Tooltip title="Events">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin/competitions/${competition.id}`}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Synchronization">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin/competitions/${competition.id}/sync`}
                  >
                    <SyncIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={`/admin/competitions/${competition.id}/settings`}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Public view">
                  <IconButton
                    color="inherit"
                    component={Link}
                    to={location.pathname.replace(/^\/admin/, '')}
                  >
                    <RemoveRedEyeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="My competitions">
                  <IconButton color="inherit" component={Link} to="/admin">
                    <AccountCircleIcon />
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
                  path="/admin/competitions/:competitionId/settings"
                  component={AdminSettings}
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
