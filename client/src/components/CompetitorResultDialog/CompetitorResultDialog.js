import React, { Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import { formatResult } from '../../logic/results';

const CompetitorResultDialog = ({
  result,
  competitionId,
  eventId,
  stats,
  onClose,
}) => {
  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <Fragment>
          <DialogTitle>#{result.ranking}</DialogTitle>
          <DialogContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="subtitle2">Event</Typography>
                <Typography variant="body2">
                  {result.round.event.name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Round</Typography>
                <Typography variant="body2">{result.round.name}</Typography>
                <Link
                  component={RouterLink}
                  to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                >
                  All results
                </Link>
              </Grid>
              {result.ranking && (
                <Fragment>
                  <Grid item>
                    <Typography variant="subtitle2">Times</Typography>
                    <Typography variant="body2">
                      {result.attempts
                        .map(attempt =>
                          formatResult(attempt, result.round.event.id)
                        )
                        .join(', ')}
                    </Typography>
                  </Grid>
                  {stats.map(({ name, fn, type }) => (
                    <Grid item key={name}>
                      <Typography variant="subtitle2">{name}</Typography>
                      <Typography variant="body2">
                        <ResultWithRecordTag
                          result={formatResult(
                            fn(result.attempts, result.round.event.id),
                            eventId,
                            type === 'average'
                          )}
                          recordTag={result.recordTags[type]}
                          showPb={true}
                        />
                      </Typography>
                    </Grid>
                  ))}
                </Fragment>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </Fragment>
      )}
    </Dialog>
  );
};

export default CompetitorResultDialog;
