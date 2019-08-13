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
import { statsToDisplay } from '../../logic/results-table-utils';

const CompetitorResultDialog = ({ result, competitionId, onClose }) => {
  if (!result) return null;
  const { round } = result;
  const stats = statsToDisplay(round.format, round.event.id);

  return (
    <Dialog open={true} fullWidth={true} onClose={onClose}>
      <DialogTitle>#{result.ranking}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="subtitle2">Event</Typography>
            <Typography variant="body2">{round.event.name}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle2">Round</Typography>
            <Typography variant="body2">{round.name}</Typography>
            <Link
              component={RouterLink}
              to={`/competitions/${competitionId}/rounds/${round.id}`}
            >
              All results
            </Link>
          </Grid>
          {result.ranking && (
            <Fragment>
              <Grid item>
                <Typography variant="subtitle2">
                  {['333fm', '333mbf'].includes(round.event.id)
                    ? 'Results'
                    : 'Times'}
                </Typography>
                <Typography variant="body2">
                  {result.attempts
                    .map(attempt => formatResult(attempt, round.event.id))
                    .join(', ')}
                </Typography>
              </Grid>
              {stats.map(({ name, type, recordType }) => (
                <Grid item key={name}>
                  <Typography variant="subtitle2">{name}</Typography>
                  <Typography variant="body2">
                    <ResultWithRecordTag
                      result={formatResult(
                        result[type],
                        round.event.id,
                        type === 'average'
                      )}
                      recordTag={result.recordTags[recordType]}
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
    </Dialog>
  );
};

export default CompetitorResultDialog;
