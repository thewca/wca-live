import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import Footer from '../Footer/Footer';
import logo from './logo.svg';
import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import Competitions from '../Competitions/Competitions';
import RecordList from '../RecordList/RecordList';
import { COMPETITION_INFO_FRAGMENT } from '../../logic/graphql-fragments';
import {
  geolocationAvailable,
  nearestCompetition,
} from '../../logic/geolocation';

const COMPETITIONS_QUERY = gql`
  query Competitions {
    competitions {
      upcoming {
        ...competitionInfo
      }
      inProgress {
        ...competitionInfo
        schedule {
          venues {
            latitude
            longitude
          }
        }
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
    padding: theme.spacing(2, 1),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(2),
    },
    display: 'flex',
    minHeight: '100vh',
  },
  grow: {
    flexGrow: 1,
  },
  fullWidth: {
    width: '100%',
  },
  center: {
    textAlign: 'center',
  },
}));

const Home = ({ history }) => {
  const classes = useStyles();
  const { data, loading, error } = useQuery(COMPETITIONS_QUERY);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const {
    competitions: { upcoming, inProgress, past },
  } = data;

  return (
    <div className={classes.root}>
      <Grid container spacing={2} direction="column" className={classes.grow}>
        <Grid item className={classes.center}>
          <img src={logo} alt="" height="128" width="128" />
          <Typography variant="h4">WCA Live</Typography>
          <Typography variant="subtitle1">
            Live results from competitions all around the world!
          </Typography>
        </Grid>
        {inProgress.length > 0 && geolocationAvailable && (
          <Grid item className={classNames(classes.fullWidth, classes.center)}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                nearestCompetition(inProgress).then(competition => {
                  history.push(`/competitions/${competition.id}`);
                });
              }}
              aria-label="Nearest competition"
            >
              Nearest competition
            </Button>
          </Grid>
        )}
        <Grid item>
          <Paper>
            <Competitions
              upcoming={upcoming}
              inProgress={inProgress}
              past={past}
            />
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <RecordList />
          </Paper>
        </Grid>
        <Grid item className={classes.grow} />
        <Grid item className={classes.fullWidth}>
          <Footer />
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
