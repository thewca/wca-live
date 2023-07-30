import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { formatAttemptResult } from '../../lib/attempt-result';
import { orderedResultStats } from '../../lib/result';
import RecordTagBadge from '../RecordTagBadge/RecordTagBadge';

function RoundResultDialog({
  result,
  format,
  eventId,
  competitionId,
  onClose,
}) {
  const stats = orderedResultStats(eventId, format);

  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <>
          <DialogTitle>
            {result.person.name} {result.ranking && `#${result.ranking}`}
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body2">{result.person.name}</Typography>
                <Link
                  component={RouterLink}
                  to={`/competitions/${competitionId}/competitors/${result.person.id}`}
                  underline="hover"
                >
                  All results
                </Link>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Country</Typography>
                <Typography variant="body2">
                  {result.person.country.name}
                </Typography>
              </Grid>
              {result.ranking && (
                <>
                  <Grid item>
                    <Typography variant="subtitle2">Attempts</Typography>
                    <Typography variant="body2">
                      {result.attempts
                        .map((attempt) =>
                          formatAttemptResult(attempt.result, eventId)
                        )
                        .join(', ')}
                    </Typography>
                  </Grid>
                  {stats.map(({ name, field, recordTagField }) => (
                    <Grid item key={name}>
                      <Typography variant="subtitle2">{name}</Typography>
                      <Typography variant="body2">
                        <RecordTagBadge recordTag={result[recordTagField]}>
                          {formatAttemptResult(result[field], eventId)}
                        </RecordTagBadge>
                      </Typography>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default RoundResultDialog;
