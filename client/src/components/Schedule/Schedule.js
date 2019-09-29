import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';

import ScheduleCard from '../ScheduleCard/ScheduleCard';
import { flatMap, groupBy, uniq, sortBy } from '../../logic/utils';
import {
  shortDate,
  toLocalDateString,
  closestDateString,
} from '../../logic/date';
import { eventRoundForActivityCode } from '../../logic/wcif';

const useStyles = makeStyles(theme => ({
  tabs: {
    marginBottom: theme.spacing(2),
  },
}));

const Schedule = ({ schedule, events, competitionId }) => {
  const classes = useStyles();
  const rooms = flatMap(schedule.venues, venue => venue.rooms);
  const allActivitiesWithRoom = flatMap(rooms, room =>
    room.activities.map(activity => [activity, room])
  );
  const activitiesWithRoom = sortBy(
    allActivitiesWithRoom.filter(
      ([activity]) =>
        !activity.activityCode.startsWith('other-') &&
        /* Ignore activities that don't have corresponding event/round data
         (e.g. if a round is removed, but still in the schedule) */
        eventRoundForActivityCode({ events }, activity.activityCode)
    ),
    ([activity]) => activity.startTime
  );
  const dates = uniq(
    activitiesWithRoom.map(([activity]) =>
      toLocalDateString(activity.startTime)
    )
  );

  const [selectedDate, setSelectedDate] = useState(closestDateString(dates));

  const activitiesWithRoomByActivityCode = Object.entries(
    groupBy(
      activitiesWithRoom.filter(
        ([activity]) => toLocalDateString(activity.startTime) === selectedDate
      ),
      ([activity]) => activity.activityCode
    )
  );

  return (
    <div>
      <Tabs
        value={selectedDate}
        variant="scrollable"
        onChange={(event, value) => setSelectedDate(value)}
        className={classes.tabs}
      >
        {dates.map(date => (
          <Tab key={date} label={shortDate(date)} value={date} />
        ))}
      </Tabs>
      <Grid container spacing={1}>
        {activitiesWithRoomByActivityCode.map(
          ([activityCode, activitiesWithRoom], index) => (
            <Grid key={index} item xs={12} sm={6} lg={4}>
              <ScheduleCard
                activityCode={activityCode}
                activitiesWithRoom={activitiesWithRoom}
                events={events}
                competitionId={competitionId}
              />
            </Grid>
          )
        )}
      </Grid>
    </div>
  );
};

export default Schedule;
