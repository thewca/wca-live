import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import { wcaUrl } from '../../logic/url-utils';
import { flatMap } from '../../logic/utils';
import Schedule from '../Schedule/Schedule';
import CubingIcon from '../CubingIcon/CubingIcon';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      countries {
        name
      }
      events {
        _id
        id
        name
        rounds {
          id
          name
          active
          open
        }
      }
      schedule {
        venues {
          name
          rooms {
            _id
            id
            name
            color
            activities {
              _id
              id
              activityCode
              name
              startTime
              endTime
            }
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  fullWidth: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
}));

const CompetitionHome = ({ match }) => {
  const classes = useStyles();
  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  const active = flatMap(competition.events, event =>
    event.rounds.filter(round => round.active).map(round => [event, round])
  );

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item className={classes.fullWidth}>
        <Typography variant="h5" gutterBottom noWrap>
          Welcome to {competition.name}!
        </Typography>
        <Typography>
          {`This competition takes place in
            ${
              competition.countries.length === 1
                ? competition.countries[0].name
                : 'multiple countries'
            }.
            Check out the `}
          <Link
            href={wcaUrl(`/competitions/${competition.id}`)}
            target="_blank"
          >
            WCA website
          </Link>
          {` for more details on the competition.`}
        </Typography>
      </Grid>
      {active.length > 0 && (
        <Grid item className={classes.fullWidth}>
          <Typography variant="h5" gutterBottom>
            Active rounds
          </Typography>
          <Grid container spacing={1}>
            {active.map(([event, round]) => (
              <Grid item key={round.id} xs={12} sm={6} lg={4}>
                <Card>
                  <CardActionArea
                    component={RouterLink}
                    to={`/competitions/${competition.id}/rounds/${round.id}`}
                  >
                    <CardHeader
                      avatar={<CubingIcon eventId={event.id} />}
                      title={`${event.name} - ${round.name}`}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
      <Grid item className={classes.fullWidth}>
        <Grid container alignContent="center">
          <Grid item>
            <Typography variant="h5">Schedule</Typography>
          </Grid>
          <Grid item className={classes.grow} />
          <Grid item>
            <Tooltip
              title={`
              All the dates and times below are displayed in your local timezone:
              ${Intl.DateTimeFormat().resolvedOptions().timeZone}
            `}
            >
              <NotificationImportantIcon color="action" />
            </Tooltip>
          </Grid>
        </Grid>
        <Schedule
          schedule={competition.schedule}
          events={competition.events}
          competitionId={competition.id}
        />
      </Grid>
    </Grid>
  );
};

export default CompetitionHome;
