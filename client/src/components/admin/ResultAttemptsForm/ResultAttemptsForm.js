import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { useConfirm } from 'material-ui-confirm';
import AttemptResultField from '../AttemptResultField/AttemptResultField';
import useKeyNavigation from './useKeyNavigation';
import ResultSelect from './ResultSelect';
import { setAt, times } from '../../../lib/utils';
import {
  trimTrailingSkipped,
  meetsCutoff,
  formatAttemptResult,
  attemptResultsWarning,
  applyTimeLimit,
  applyCutoff,
  best,
  average,
} from '../../../lib/attempt-result';
import { cutoffToString, timeLimitToString } from '../../../lib/formatters';
import {
  shouldComputeAverage,
  paddedAttemptResults,
} from '../../../lib/results';

const useStyles = makeStyles((theme) => ({
  resultSelect: {
    margin: theme.spacing(2, 0),
  },
  grow: {
    flexGrow: 1,
  },
  keyboardIcon: {
    verticalAlign: 'middle',
  },
}));

function ResultAttemptsForm({
  result,
  results,
  onResultChange,
  eventId,
  format,
  timeLimit,
  cutoff,
  onSubmit,
  disabled = false,
  focusOnResultChange = false,
}) {
  const classes = useStyles();
  const confirm = useConfirm();

  const { numberOfAttempts } = format;

  const defaultAttemptResults = useMemo(() => {
    return times(numberOfAttempts, () => 0);
  }, [numberOfAttempts]);

  const [attemptResults, setAttemptResults] = useState(defaultAttemptResults);

  const rootRef = useRef(null);

  useKeyNavigation(rootRef);

  useEffect(() => {
    setAttemptResults(
      result
        ? paddedAttemptResults(result, numberOfAttempts)
        : defaultAttemptResults
    );
  }, [result, numberOfAttempts, defaultAttemptResults]);

  useEffect(() => {
    if (!focusOnResultChange) return;

    const [
      resultInput,
      firstAttemptInput,
    ] = rootRef.current.getElementsByTagName('input');

    if (result) {
      // Wait for the above useEffect to set attempt result values
      // and then select the given field.
      setTimeout(() => {
        firstAttemptInput.focus();
        firstAttemptInput.select();
      }, 0);
    } else {
      resultInput.focus();
    }
  }, [result, focusOnResultChange]);

  const disabledFromIndex = meetsCutoff(attemptResults, cutoff)
    ? numberOfAttempts
    : cutoff.numberOfAttempts;

  function handleAttemptResultChange(index, value) {
    const newAttemptResults = setAt(attemptResults, index, value);
    setAttemptResults(
      applyCutoff(applyTimeLimit(newAttemptResults, timeLimit), cutoff)
    );
  }

  function handleSubmitClick() {
    confirmSubmission().then(() => {
      const attempts = trimTrailingSkipped(attemptResults).map((result) => ({
        result,
      }));
      onSubmit(attempts);
    });
  }

  function confirmSubmission() {
    const submissionWarning = attemptResultsWarning(attemptResults, eventId);

    if (submissionWarning) {
      return confirm({
        description: submissionWarning,
        confirmationText: 'Submit',
      });
    } else {
      return Promise.resolve();
    }
  }

  return (
    <Grid container direction="column" spacing={1} ref={rootRef}>
      <Grid item>
        <Typography variant="body2">
          Time limit: {timeLimitToString(timeLimit, eventId)}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2">
          Cutoff: {cutoffToString(cutoff, eventId)}
        </Typography>
      </Grid>
      <Grid item className={classes.resultSelect}>
        <ResultSelect
          results={results}
          value={result}
          onChange={onResultChange}
          TextFieldProps={{
            autoFocus: true,
            fullWidth: true,
            variant: 'outlined',
            inputProps: { 'data-type': 'result-select' },
          }}
        />
      </Grid>
      {attemptResults.map((attemptResult, index) => (
        <Grid item key={index}>
          <AttemptResultField
            eventId={eventId}
            label={`Attempt ${index + 1}`}
            disabled={!result || disabled || index >= disabledFromIndex}
            value={attemptResult}
            onChange={(value) => handleAttemptResultChange(index, value)}
            TextFieldProps={{
              fullWidth: true,
              variant: 'outlined',
              inputProps: { 'data-type': 'attempt-result' },
            }}
          />
        </Grid>
      ))}
      <Grid item container>
        <Grid item xs>
          <Typography variant="body2">
            Best: {formatAttemptResult(best(attemptResults), eventId)}
          </Typography>
        </Grid>
        {shouldComputeAverage(eventId, format) && (
          <Grid item xs>
            <Typography variant="body2">
              Average:{' '}
              {formatAttemptResult(average(attemptResults, eventId), eventId)}
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid item container alignItems="flex-end">
        <Grid item>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            disabled={!result || disabled}
            onClick={handleSubmitClick}
          >
            Submit
          </Button>
        </Grid>
        <Grid item className={classes.grow} />
        <Grid item>
          <Tooltip
            title={
              <div>
                Key bindings:
                <div>{`/ or d - DNF`}</div>
                <div>{`* or s - DNS`}</div>
                <div>{`Up, Down, Enter - navigation`}</div>
              </div>
            }
          >
            <KeyboardIcon className={classes.keyboardIcon} color="action" />
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ResultAttemptsForm;
