import React from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import Footer from '../Footer/Footer';
import logo from './logo.svg';
import CustomQuery from '../CustomQuery/CustomQuery';
import CompetitionList from '../CompetitionList/CompetitionList';
import { COMPETITION_INFO_FRAGMENT } from '../../logic/graphql-fragments';

const COMPETITIONS_QUERY = gql`
  query Competitions {
    competitions {
      upcoming {
        ...competitionInfo
      }
      inProgress {
        ...competitionInfo
      }
      past {
        ...competitionInfo
      }
    }
  }
  ${COMPETITION_INFO_FRAGMENT}
`;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    minHeight: '100vh',
  },
  grow: {
    flexGrow: 1,
  },
  center: {
    textAlign: 'center',
  },
}));

const Home = () => {
  const classes = useStyles();
  return (
    <CustomQuery query={COMPETITIONS_QUERY}>
      {({
        data: {
          competitions: { upcoming, inProgress, past },
        },
      }) => (
        <div className={classes.root}>
          <Grid
            container
            spacing={2}
            direction="column"
            className={classes.grow}
          >
            <Grid item className={classes.center}>
              <img src={logo} alt="" height="128" width="128" />
              <Typography variant="h4">WCA Live</Typography>
              <Typography variant="subtitle1">
                Live results from competitions all around the world!
              </Typography>
            </Grid>
            {inProgress.length > 0 && (
              <Grid item>
                <Paper>
                  <CompetitionList
                    title="Happening right now!"
                    competitions={inProgress}
                  />
                </Paper>
              </Grid>
            )}
            {upcoming.length > 0 && (
              <Grid item>
                <Paper>
                  <CompetitionList title="Upcoming" competitions={upcoming} />
                </Paper>
              </Grid>
            )}
            {past.length > 0 && (
              <Grid item>
                <Paper>
                  <CompetitionList title="Past" competitions={past} />
                </Paper>
              </Grid>
            )}
            <Grid item className={classes.grow} />
            <Grid item>
              <Footer />
            </Grid>
          </Grid>
        </div>
      )}
    </CustomQuery>
  );
};

export default Home;
