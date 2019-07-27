import React, { Fragment, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import gql from 'graphql-tag';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import CustomQuery from '../CustomQuery/CustomQuery';
import EventList from '../EventList/EventList';
import Round from '../Round/Round';
import Competitors from '../Competitors/Competitors';
import Competitor from '../Competitor/Competitor';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      events {
        id
        name
        rounds {
          id
          name
          open
        }
      }
    }
  }
`;

const drawerWidth = 250;

const useStyles = makeStyles(theme => ({
  appBarShift: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
    },
  },
  content: {
    overflowY: 'auto',
    padding: '16px 8px',
    [theme.breakpoints.up('md')]: {
      padding: 24,
    },
  },
  contentShift: {
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  title: {
    flexGrow: 1,
  },
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
}));

const Competition = ({ match }) => {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data }) => {
        const { competition } = data;

        const drawerContent = (
          <Fragment>
            <div className={classes.toolbar}>
              <IconButton component={Link} to="/">
                <Icon>home</Icon>
              </IconButton>
              <IconButton
                component={Link}
                to={`/competitions/${competition.id}/competitors`}
              >
                <Icon>people</Icon>
              </IconButton>
            </div>
            <Divider />
            <EventList
              events={competition.events}
              competitionId={competition.id}
            />
          </Fragment>
        );

        return (
          <Fragment>
            <AppBar position="static" className={classes.appBarShift}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  className={classes.menuButton}
                  onClick={() => setMobileOpen(true)}
                >
                  <Icon>menu</Icon>
                </IconButton>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classes.title}
                  noWrap={true}
                >
                  <Link
                    to={`/competitions/${competition.id}`}
                    className={classes.titleLink}
                  >
                    {competition.name}
                  </Link>
                </Typography>
              </Toolbar>
            </AppBar>
            <Hidden mdUp>
              <Drawer
                className={classes.drawer}
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                onClick={() => setMobileOpen(false)}
                classes={{ paper: classes.drawer }}
              >
                {drawerContent}
              </Drawer>
            </Hidden>
            <Hidden smDown>
              <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{ paper: classes.drawer }}
              >
                {drawerContent}
              </Drawer>
            </Hidden>
            <div className={classes.content + ' ' + classes.appBarShift}>
              <Switch>
                <Route
                  exact
                  path="/competitions/:competitionId/rounds/:roundId"
                  component={Round}
                />
                <Route
                  exact
                  path="/competitions/:competitionId/competitors"
                  component={Competitors}
                />
                <Route
                  exact
                  path="/competitions/:competitionId/competitors/:competitorId"
                  component={Competitor}
                />
              </Switch>
            </div>
          </Fragment>
        );
      }}
    </CustomQuery>
  );
};

export default Competition;
