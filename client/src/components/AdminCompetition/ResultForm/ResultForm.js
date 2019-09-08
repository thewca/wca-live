import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import withConfirm from 'material-ui-confirm';

import CustomMutation from '../../CustomMutation/CustomMutation';
import AttemptField from '../AttemptField/AttemptField';
import ResultSelect from '../ResultSelect/ResultSelect';
import { setAt, times, trimTrailingZeros } from '../../../logic/utils';
import {
  meetsCutoff,
  formatResult,
  attemptsWarning,
} from '../../../logic/results';
import { best, average } from '../../../logic/stats';
import { cutoffToString, timeLimitToString } from '../../../logic/formatters';

const ResultForm = ({
  result,
  results,
  onResultChange,
  format,
  eventId,
  timeLimit,
  cutoff,
  setResultMutation,
  competitionId,
  roundId,
  confirm,
}) => {
  const { solveCount } = format;
  const [attempts, setAttempts] = useState(times(solveCount, () => 0));
  const rootRef = useRef(null);

  useEffect(() => {
    setAttempts(
      times(solveCount, index => (result && result.attempts[index]) || 0)
    );
  }, [result, solveCount]);

  useKeyNavigation(rootRef);

  const computeAverage =
    [3, 5].includes(format.solveCount) && eventId !== '333mbf';

  const submissionWarning = attemptsWarning(attempts, eventId);

  const disabledFromIndex = meetsCutoff(attempts, cutoff, eventId)
    ? solveCount
    : cutoff.numberOfAttempts;

  return (
    <Grid container spacing={1} ref={rootRef}>
      <Grid item xs={12}>
        <Typography variant="body2">
          Time limit: {timeLimitToString(timeLimit, eventId)}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">
          Cutoff: {cutoffToString(cutoff, eventId)}
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: 16, marginTop: 16 }}>
        <ResultSelect
          results={results}
          value={result}
          onChange={onResultChange}
        />
      </Grid>
      {attempts.map((attempt, index) => (
        <Grid item xs={12} key={index}>
          <AttemptField
            eventId={eventId}
            label={`Attempt ${index + 1}`}
            initialValue={attempt}
            disabled={!result || index >= disabledFromIndex}
            onValue={value => {
              const updatedValue =
                timeLimit && value >= timeLimit.centiseconds ? -1 : value;
              const updatedAttempts = setAt(attempts, index, updatedValue);
              setAttempts(
                meetsCutoff(updatedAttempts, cutoff, eventId)
                  ? updatedAttempts
                  : updatedAttempts.map((attempt, index) =>
                      index < cutoff.numberOfAttempts ? attempt : 0
                    )
              );
            }}
          />
        </Grid>
      ))}
      <Grid item xs={6}>
        <Typography variant="body2">
          Best: {formatResult(best(attempts), eventId)}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        {computeAverage && (
          <Typography variant="body2">
            Average:{' '}
            {formatResult(
              average(attempts, eventId, solveCount),
              eventId,
              true
            )}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="flex-end">
          <Grid item>
            <CustomMutation
              mutation={setResultMutation}
              variables={{
                competitionId,
                roundId,
                result: {
                  personId: result && result.person.id,
                  attempts: trimTrailingZeros(attempts),
                },
              }}
              onCompleted={() => {
                const resultInput = rootRef.current.getElementsByTagName(
                  'input'
                )[0];
                resultInput.focus();
                resultInput.select();
              }}
            >
              {(setResult, { loading }) => (
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  disabled={!result || loading}
                  onClick={
                    submissionWarning
                      ? confirm(setResult, {
                          description: submissionWarning,
                          confirmationText: 'Submit',
                        })
                      : setResult
                  }
                >
                  Submit
                </Button>
              )}
            </CustomMutation>
          </Grid>
          <Grid item style={{ flexGrow: 1 }} />
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
              <Icon style={{ verticalAlign: 'middle' }} color="action">
                keyboard
              </Icon>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const useKeyNavigation = containerRef => {
  useEffect(() => {
    const getInputs = () => {
      return Array.from(
        containerRef.current.querySelectorAll('input, button')
      ).filter(input => !input.disabled);
    };

    const handleKeyPress = event => {
      const inputs = getInputs();
      const mod = n => (n + inputs.length) % inputs.length;
      const index = inputs.findIndex(input => event.target === input);
      if (
        ['ArrowUp', 'ArrowDown'].includes(event.key) &&
        containerRef.current.getElementsByClassName('MuiMenuItem-root').length >
          0
      ) {
        /* Don't interrupt navigation within result selectable list. */
        return;
      }
      if (
        event.target.tagName === 'INPUT' &&
        ['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)
      ) {
        /* Blur the current input first, as it may affect which fields are disabled.
           After that get the updated input list.
           Note: blur is a synchronous event, so this call triggers all onBlur handlers before continuing. */
        event.target.blur();
      }
      const updatedInputs = getInputs();
      if (index === -1) {
        if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
          updatedInputs[0].focus();
          updatedInputs[0].select();
          event.preventDefault();
        }
      } else if (event.key === 'ArrowUp') {
        const previousElement = updatedInputs[mod(index - 1)];
        previousElement.focus();
        previousElement.select && previousElement.select();
        event.preventDefault();
      } else if (
        event.key === 'ArrowDown' ||
        (event.target.tagName === 'INPUT' && event.key === 'Enter')
      ) {
        const nextElement = updatedInputs[mod(index + 1)];
        nextElement.focus();
        nextElement.select && nextElement.select();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        event.target.blur();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};

export default withConfirm(ResultForm);
