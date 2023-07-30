import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import CubingIcon from "../CubingIcon/CubingIcon";
import RoomLabel from "../RoomLabel/RoomLabel";
import { parseActivityCode } from "../../lib/activity-code";
import { eventRoundForActivityCode } from "../../lib/competition";
import { formatTimeRange } from "../../lib/date";
import { parseISO } from "date-fns";
import { min, max, clamp } from "../../lib/utils";

function ScheduleCard({
  activityCode,
  activities,
  competitionEvents,
  competitionId,
}) {
  const { attemptNumber } = parseActivityCode(activityCode);
  const { event, round } = eventRoundForActivityCode(
    competitionEvents,
    activityCode
  );
  const title = attemptNumber
    ? `${event.name} - ${round.name} (Attempt ${attemptNumber})`
    : `${event.name} - ${round.name}`;

  const startTime = min(activities.map((activity) => activity.startTime));
  const endTime = max(activities.map((activity) => activity.endTime));
  const duration = parseISO(endTime) - parseISO(startTime);
  const distanceFromStart = new Date() - parseISO(startTime);
  const progressPercentage = Math.round(
    (clamp(distanceFromStart, 0, duration) / duration) * 100
  );

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/competitions/${competitionId}/rounds/${round.id}`}
        disabled={!round.open}
      >
        <CardHeader avatar={<CubingIcon eventId={event.id} />} title={title} />
      </CardActionArea>
      <CardContent>
        <Grid container spacing={1}>
          {activities.map((activity) => (
            <Grid key={activity.id} item xs={6}>
              <RoomLabel room={activity.room} />
              <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                {formatTimeRange(activity.startTime, activity.endTime)}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      {0 < progressPercentage && progressPercentage < 100 && (
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      )}
    </Card>
  );
}

export default ScheduleCard;
