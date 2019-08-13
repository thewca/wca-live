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

const ResultDialog = ({ result, format, eventId, competitionId, onClose }) => {
  const stats = statsToDisplay(format, eventId);

  return (
    <Dialog open={!!result} fullWidth={true} onClose={onClose}>
      {!!result && (
        <Fragment>
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
                <Fragment>
                  <Grid item>
                    <Typography variant="subtitle2">
                      {['333fm', '333mbf'].includes(eventId)
                        ? 'Results'
                        : 'Times'}
                    </Typography>
                    <Typography variant="body2">
                      {result.attempts
                        .map(attempt => formatResult(attempt, eventId))
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
                            eventId,
                            type === 'average'
                          )}
                          recordTag={result.recordTags[recordType]}
                          showPb={false}
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

export default ResultDialog;
