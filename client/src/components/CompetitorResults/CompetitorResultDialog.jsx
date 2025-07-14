import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { formatAttemptResult } from "../../lib/attempt-result";
import { orderedResultStats } from "../../lib/result";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";

function CompetitorResultDialog({ result, competitionId, onClose }) {
  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <>
          <DialogTitle>#{result.ranking}</DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle2">Event</Typography>
                <Typography variant="body2">
                  {result.round.competitionEvent.event.name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Round</Typography>
                <Typography variant="body2">{result.round.name}</Typography>
                <Link
                  component={RouterLink}
                  to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                  underline="hover"
                >
                  All results
                </Link>
              </Grid>
              {result.ranking && (
                <>
                  <Grid item>
                    <Typography variant="subtitle2">Attempts</Typography>
                    <Typography variant="body2">
                      {result.attempts
                        .map((attempt) =>
                          formatAttemptResult(
                            attempt.result,
                            result.round.competitionEvent.event.id,
                          ),
                        )
                        .join(", ")}
                    </Typography>
                  </Grid>
                  {orderedResultStats(
                    result.round.competitionEvent.event.id,
                    result.round.format,
                  ).map(({ name, field, recordTagField }) => (
                    <Grid item key={name}>
                      <Typography variant="subtitle2">{name}</Typography>
                      <Typography variant="body2">
                        <RecordTagBadge recordTag={result[recordTagField]}>
                          {formatAttemptResult(
                            result[field],
                            result.round.competitionEvent.event.id,
                          )}
                        </RecordTagBadge>
                      </Typography>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompetitorResultDialog;
