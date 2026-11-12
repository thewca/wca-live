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

function formatCentiseconds(centiseconds) {
  const totalSeconds = Math.floor(centiseconds / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = centiseconds % 100;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (hundredths > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getRoundName(competitionEvents, roundId) {
  const { event, round } = eventRoundForActivityCode(
    competitionEvents,
    roundId,
  );
  return `${event.name} - ${round.name}`;
}

function getTimeLimitText(round, event, competitionEvents) {
  if (!round.timeLimit) return null;

  if (event.id === "333fm") {
    return "Time limit: 60 minutes";
  }

  if (event.id === "333mbf") {
    return "Time limit: 10 minutes per cube, max. 60 minutes";
  }

  const time = formatCentiseconds(round.timeLimit.centiseconds);
  const cumulativeRoundIds = round.timeLimit.cumulativeRoundIds || [];

  if (cumulativeRoundIds.length === 0) {
    return `Time limit: ${time}`;
  }

  if (
    cumulativeRoundIds.length === 1 &&
    cumulativeRoundIds[0] === round.id
  ) {
    return `Time limit: ${time} in total`;
  }

  const roundNames = cumulativeRoundIds.map((roundId) =>
    getRoundName(competitionEvents, roundId),
  );

  return `Shared time limit: ${time} total for ${roundNames.join(" + ")}`;
}

function getCutoffText(round, event) {
  if (!round.cutoff) return null;

  const attempts = round.cutoff.numberOfAttempts;
  const attemptResult = round.cutoff.attemptResult;

  const cutoffResult =
    event.id === "333fm"
      ? `${attemptResult} moves`
      : formatCentiseconds(attemptResult);

  return `Cutoff: ${cutoffResult} · ${attempts} ${
    attempts === 1 ? "attempt" : "attempts"
  }`;
}

function ScheduleCard({
  activityCode,
  activities,
  competitionEvents,
  competitionId,
}) {
  const { attemptNumber } = parseActivityCode(activityCode);
  const { event, round } = eventRoundForActivityCode(
    competitionEvents,
    activityCode,
  );

  const title = attemptNumber
    ? `${event.name} - ${round.name} (Attempt ${attemptNumber})`
    : `${event.name} - ${round.name}`;

  const timeLimitText = getTimeLimitText(round, event, competitionEvents);
  const cutoffText = getCutoffText(round, event);

  const startTime = min(activities.map((activity) => activity.startTime));
  const endTime = max(activities.map((activity) => activity.endTime));
  const duration = parseISO(endTime) - parseISO(startTime);
  const distanceFromStart = new Date() - parseISO(startTime);
  const progressPercentage = Math.round(
    (clamp(distanceFromStart, 0, duration) / duration) * 100,
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
          {timeLimitText && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {timeLimitText}
              </Typography>
            </Grid>
          )}
          {cutoffText && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {cutoffText}
              </Typography>
            </Grid>
          )}
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
