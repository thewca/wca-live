import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import SyncIcon from '@material-ui/icons/Sync';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleIcon from '@material-ui/icons/People';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AdminEvents from '../AdminEvents/AdminEvents';
import Synchronize from '../Synchronize/Synchronize';
import AdminSettings from '../AdminSettings/AdminSettings';
import RoundDoubleCheck from '../RoundDoubleCheck/RoundDoubleCheck';
import AdminRound from '../AdminRound/AdminRound';
import AdminCompetitors from '../AdminCompetitors/AdminCompetitors';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      currentUserManagerAccess
      currentUserScoretakerAccess
    }
    me {
      id
    }
  }
`;

const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`;

const useStyles = makeStyles((theme) => ({
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  toolbar: {
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  admin: {
    marginLeft: theme.spacing(1),
  },
  grow: {
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  content: {
    position: 'relative' /* For LinearProgress */,
    padding: theme.spacing(3),
  },
}));

const AdminCompetition = ({ match, location, history }) => {
  const classes = useStyles();

  const apolloClient = useApolloClient();
  const [
    signOut,
    { loading: signOutLoading, error: signOutError },
  ] = useMutation(SIGN_OUT_MUTATION, {
    onCompleted: (data) => {
      apolloClient.clearStore().then(() => history.push('/'));
    },
  });

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: match.params.id },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition, me } = data;
  const { currentUserManagerAccess, currentUserScoretakerAccess } = competition;
  if (!currentUserScoretakerAccess) {
    return <Redirect to={`/competitions/${competition.id}`} />;
  }

  return (
    <div>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
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
          <Tooltip title="Competitors">
            <IconButton
              color="inherit"
              component={Link}
              to={`/admin/competitions/${competition.id}/competitors`}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          {currentUserManagerAccess && (
            <Tooltip title="Settings">
              <IconButton
                color="inherit"
                component={Link}
                to={`/admin/competitions/${competition.id}/settings`}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Public view">
            <IconButton
              color="inherit"
              component={Link}
              to={location.pathname.replace(/^\/admin/, '')}
            >
              <RemoveRedEyeIcon />
            </IconButton>
          </Tooltip>
          {me ? (
            <Tooltip title="My competitions">
              <IconButton color="inherit" component={Link} to="/admin">
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Sign out">
              <IconButton
                color="inherit"
                onClick={signOut}
                disabled={signOutLoading}
              >
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          )}
          {signOutError && <ErrorSnackbar error={signOutError} />}
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
          {currentUserManagerAccess && (
            <Route
              exact
              path="/admin/competitions/:competitionId/settings"
              component={AdminSettings}
            />
          )}
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
          <Route
            exact
            path="/admin/competitions/:competitionId/competitors"
            component={AdminCompetitors}
          />
          <Redirect to={`/admin/competitions/${competition.id}`} />
        </Switch>
      </div>
    </div>
  );
};

export default AdminCompetition;
