import React, { useState } from 'react';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ScheduleCard from './ScheduleCard';
import { groupBy, uniq, sortBy } from '../../lib/utils';
import {
  formatDateShort,
  toLocalDateString,
  closestDateString,
} from '../../lib/date';
import { eventRoundForActivityCode } from '../../lib/competition';
import { parseActivityCode } from '../../lib/activity-code';

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginBottom: theme.spacing(2),
  },
}));

function Schedule({ venues, competitionEvents, competitionId }) {
  const classes = useStyles();

  const activities = venues
    .flatMap((venue) => venue.rooms)
    .flatMap((room) =>
      room.activities.map((activity) => ({ ...activity, room }))
    )
    .filter(
      (activity) =>
        parseActivityCode(activity.activityCode).type === 'official' &&
        // Ignore activities that don't have corresponding event/round data
        // (e.g. if a round is removed, but still in the schedule).
        eventRoundForActivityCode(competitionEvents, activity.activityCode)
    );

  const sortedActivities = sortBy(activities, (activity) => activity.startTime);

  const dates = uniq(
    sortedActivities.map((activity) => toLocalDateString(activity.startTime))
  );

  const [selectedDate, setSelectedDate] = useState(closestDateString(dates));

  const selectedDateActivities = sortedActivities.filter(
    (activity) => toLocalDateString(activity.startTime) === selectedDate
  );

  const activitiesByActivityCode = groupBy(
    selectedDateActivities,
    (activity) => activity.activityCode
  );

  return (
    <>
      <Tabs
        value={selectedDate}
        variant="scrollable"
        onChange={(event, value) => setSelectedDate(value)}
        className={classes.tabs}
      >
        {dates.map((date) => (
          <Tab key={date} label={formatDateShort(date)} value={date} />
        ))}
      </Tabs>
      <Grid container spacing={1}>
        {Object.entries(activitiesByActivityCode).map(
          ([activityCode, activities]) => (
            <Grid key={activityCode} item xs={12} sm={6} lg={4}>
              <ScheduleCard
                activityCode={activityCode}
                activities={activities}
                competitionEvents={competitionEvents}
                competitionId={competitionId}
              />
            </Grid>
          )
        )}
      </Grid>
    </>
  );
}

export default Schedule;
