import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import SyncIcon from '@material-ui/icons/Sync';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleIcon from '@material-ui/icons/People';

const useStyles = makeStyles((theme) => ({
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
}));

function AdminCompetitionToolbar({ competition }) {
  const classes = useStyles();
  const location = useLocation();

  return (
    <Toolbar className={classes.toolbar}>
      <RouterLink
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
      </RouterLink>
      <div className={classes.grow} />
      <Tooltip title="Events">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={`/admin/competitions/${competition.id}`}
        >
          <ViewListIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Synchronization">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={`/admin/competitions/${competition.id}/sync`}
        >
          <SyncIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Competitors">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={`/admin/competitions/${competition.id}/competitors`}
        >
          <PeopleIcon />
        </IconButton>
      </Tooltip>
      {competition.access.canManage && (
        <Tooltip title="Settings">
          <IconButton
            color="inherit"
            component={RouterLink}
            to={`/admin/competitions/${competition.id}/settings`}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Public view">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={location.pathname.replace(/^\/admin/, '')}
        >
          <RemoveRedEyeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Admin">
        <IconButton color="inherit" component={RouterLink} to="/admin">
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

export default AdminCompetitionToolbar;
