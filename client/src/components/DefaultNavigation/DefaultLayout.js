import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Grid, Toolbar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import logo from './logo.svg';
import UserMenuAvatar from '../UserMenuAvatar/UserMenuAvatar';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  grow: {
    flexGrow: 1,
  },
  homeLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
  },
  title: {
    marginLeft: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
  },
}));

function DefaultLayout({ currentUser, loaded, children }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Toolbar>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <RouterLink to="/" className={classes.homeLink}>
              <img src={logo} alt="wca logo" height="40" />
              <Typography variant="h6" className={classes.title}>
                WCA Live
              </Typography>
            </RouterLink>
          </Grid>
          <Grid item className={classes.grow} />
          {loaded &&
            (currentUser ? (
              <Grid item>
                <UserMenuAvatar user={currentUser} />
              </Grid>
            ) : (
              <Grid item>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  component={RouterLink}
                  to="/sign-in"
                >
                  Sign in
                </Button>
              </Grid>
            ))}
        </Grid>
      </Toolbar>
      <div className={classes.content}>{children}</div>
    </div>
  );
}

export default DefaultLayout;
