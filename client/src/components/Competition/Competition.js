import React, { Fragment } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import EventList from '../EventList/EventList';
import Round from '../Round/Round';

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
        }
      }
    }
  }
`;

const drawerWidth = 250;

const useStyles = makeStyles(() => ({
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    marginLeft: drawerWidth,
    padding: 24,
  },
}));

const Competition = ({ match }) => {
  const classes = useStyles();

  return (
    <Query query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <LinearProgress />;
        const { competition } = data;
        return (
          <Fragment>
            <Drawer
              open={true}
              variant="permanent"
              classes={{ paper: classes.drawerPaper }}
            >
              <div style={{ padding: 8 }}>
                <Typography variant="subtitle1" align="center">
                  {competition.name}
                </Typography>
              </div>
              <Divider />
              <EventList events={competition.events} competitionId={competition.id} />
            </Drawer>
            <div className={classes.content}>
              <Switch>
                <Route exact path="/competitions/:competitionId/rounds/:roundId" component={Round} />
              </Switch>
            </div>
          </Fragment>
        );
      }}
    </Query>
  )
};

export default Competition;
