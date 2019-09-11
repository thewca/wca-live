import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import CubingIcon from '../CubingIcon/CubingIcon';
import RoomLabel from '../RoomLabel/RoomLabel';
import { parseActivityCode } from '../../logic/wcif';
import { shortLocalTime } from '../../logic/date';

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100%',
  },
  timeRange: {
    marginLeft: theme.spacing(1),
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}));

const ScheduleCard = ({
  activityCode,
  activitiesWithRoom,
  events,
  competitionId,
}) => {
  const classes = useStyles();
  const { eventId, roundNumber, attemptNumber } = parseActivityCode(
    activityCode
  );
  const roundId = `${eventId}-r${roundNumber}`;
  const event = events.find(event => event.id === eventId);
  const round = event.rounds.find(round => round.id === roundId);
  const name = attemptNumber
    ? `${event.name} - ${round.name} (Attempt ${attemptNumber})`
    : `${event.name} - ${round.name}`;
  const startTime = Math.min(
    ...activitiesWithRoom.map(([activity]) => new Date(activity.startTime))
  );
  const endTime = Math.max(
    ...activitiesWithRoom.map(([activity]) => new Date(activity.endTime))
  );
  const duration = new Date(endTime) - new Date(startTime);
  const distanceFromStart = new Date() - new Date(startTime);
  const progressPercentage = Math.round(
    (Math.min(Math.max(distanceFromStart, 0), duration) / duration) * 100
  );
  return (
    <Card className={classes.fullHeight}>
      <CardActionArea
        className={classes.fullHeight}
        component={RouterLink}
        to={`/competitions/${competitionId}/rounds/${round.id}`}
        disabled={!round.open}
      >
        <CardHeader avatar={<CubingIcon eventId={eventId} />} title={name} />
        <CardContent>
          <Grid container spacing={1}>
            {activitiesWithRoom.map(([activity, room]) => (
              <Grid key={activity.id} item xs={6}>
                <RoomLabel room={room} />
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.timeRange}
                >
                  {`${shortLocalTime(activity.startTime)} - ${shortLocalTime(
                    activity.endTime
                  )}`}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
        {0 < progressPercentage && progressPercentage < 100 && (
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            className={classes.progress}
          />
        )}
      </CardActionArea>
    </Card>
  );
};

export default ScheduleCard;
