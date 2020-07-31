import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
  title: {
    flexGrow: 1,
    color: 'inherit',
    textDecoration: 'none',
  },
  grow: {
    flexGrow: 1,
  },
}));

function CompetitionToolbar({ competition, onMenuClick }) {
  const classes = useStyles();
  const location = useLocation();

  return (
    <Toolbar>
      <IconButton
        color="inherit"
        className={classes.menuButton}
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        className={classes.title}
        noWrap={true}
        component={RouterLink}
        to={`/competitions/${competition.id}`}
      >
        {competition.name}
      </Typography>
      <div className={classes.grow} />
      {competition.access.canScoretake && (
        <Tooltip title="Admin view">
          <IconButton
            color="inherit"
            component={RouterLink}
            to={`/admin${location.pathname}`}
          >
            <LockIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default CompetitionToolbar;
