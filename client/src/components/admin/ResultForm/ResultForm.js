import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { useConfirm } from 'material-ui-confirm';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AttemptField from '../AttemptField/AttemptField';
import PersonSelect from '../PersonSelect/PersonSelect';
import { setAt, times, trimTrailingZeros } from '../../../logic/utils';
import {
  meetsCutoff,
  formatAttemptResult,
  attemptsWarning,
  applyTimeLimit,
  applyCutoff,
} from '../../../logic/attempts';
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
  updateResultMutation,
  competitionId,
  roundId,
  focusOnResultChange = false,
}) => {
  const confirm = useConfirm();
  const { solveCount } = format;
  const [attempts, setAttempts] = useState(times(solveCount, () => 0));
  const rootRef = useRef(null);

  useEffect(() => {
    setAttempts(
      times(solveCount, (index) => (result && result.attempts[index]) || 0)
    );
  }, [result, solveCount]);

  useEffect(() => {
    if (focusOnResultChange && result) {
      const firstAttemptInput = rootRef.current.getElementsByTagName(
        'input'
      )[1];
      setTimeout(() => {
        firstAttemptInput.focus();
        firstAttemptInput.select();
      }, 0);
    }
  }, [result, focusOnResultChange]);

  useKeyNavigation(rootRef.current);

  const computeAverage =
    [3, 5].includes(format.solveCount) && eventId !== '333mbf';

  const submissionWarning = attemptsWarning(attempts, eventId);

  const disabledFromIndex = meetsCutoff(attempts, cutoff)
    ? solveCount
    : cutoff.numberOfAttempts;

  const persons = useMemo(() => {
    return results.map((result) => result.person);
  }, [results]);

  const [updateResult, { loading, error }] = useMutation(updateResultMutation, {
    variables: {
      competitionId,
      roundId,
      result: {
        personId: result && result.person.id,
        attempts: trimTrailingZeros(attempts),
      },
    },
    onCompleted: () => {
      const resultInput = rootRef.current.getElementsByTagName('input')[0];
      resultInput.focus();
      /* Clear the form. */
      onResultChange(null);
    },
  });

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
        <PersonSelect
          persons={persons}
          value={
            result ? persons.find((person) => person === result.person) : null
          }
          onChange={(person) => {
            onResultChange(
              person ? results.find((result) => result.person === person) : null
            );
          }}
          TextFieldProps={{ autoFocus: true, fullWidth: true }}
        />
      </Grid>
      {attempts.map((attempt, index) => (
        <Grid item xs={12} key={index}>
          <AttemptField
            eventId={eventId}
            label={`Attempt ${index + 1}`}
            initialValue={attempt}
            disabled={!result || index >= disabledFromIndex}
            onValue={(value) => {
              setAttempts(
                applyCutoff(
                  applyTimeLimit(setAt(attempts, index, value), timeLimit),
                  cutoff
                )
              );
            }}
          />
        </Grid>
      ))}
      <Grid item xs={6}>
        <Typography variant="body2">
          Best: {formatAttemptResult(best(attempts), eventId)}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        {computeAverage && (
          <Typography variant="body2">
            Average:{' '}
            {formatAttemptResult(
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
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              disabled={!result || loading}
              onClick={() => {
                if (submissionWarning) {
                  confirm({
                    description: submissionWarning,
                    confirmationText: 'Submit',
                  }).then(updateResult);
                } else {
                  updateResult();
                }
              }}
            >
              Submit
            </Button>
            {error && <ErrorSnackbar error={error} />}
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
              <KeyboardIcon
                style={{ verticalAlign: 'middle' }}
                color="action"
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const getInputs = (container) => {
  return Array.from(container.querySelectorAll('input, button')).filter(
    (input) => !input.disabled
  );
};

const useKeyNavigation = (container) => {
  useEffect(() => {
    if (!container) return;
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        event.target.blur && event.target.blur();
        return;
      }
      if (
        ['ArrowUp', 'ArrowDown'].includes(event.key) &&
        container.querySelector('[aria-expanded="true"]')
      ) {
        /* Don't interrupt navigation within competitor select list. */
        return;
      }
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Tab'].includes(event.key)) return;
      if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        /* Prevent page scrolling. */
        event.preventDefault();
      }
      if (event.target.tagName === 'INPUT') {
        /* Blur the current input first, as it may affect which fields are disabled. */
        event.target.blur();
      }
      /* Let Tab be handled as usually. */
      if (event.key === 'Tab') return;
      /* Other handlers may change which fields are disabled, so let them run first. */
      setTimeout(() => {
        const inputs = getInputs(container);
        const index = inputs.findIndex((input) => event.target === input);
        if (index === -1) return;
        const mod = (n) => (n + inputs.length) % inputs.length;
        if (event.key === 'ArrowUp') {
          const previousElement = inputs[mod(index - 1)];
          previousElement.focus();
          previousElement.select && previousElement.select();
        } else if (
          event.key === 'ArrowDown' ||
          (event.target.tagName === 'INPUT' && event.key === 'Enter')
        ) {
          const nextElement = inputs[mod(index + 1)];
          nextElement.focus();
          nextElement.select && nextElement.select();
        }
      }, 0);
    };
    container.addEventListener('keydown', handleKeyPress);
    return () => container.removeEventListener('keydown', handleKeyPress);
  }, [container]);

  useEffect(() => {
    if (!container) return;
    const handleKeyPress = (event) => {
      if (
        ['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key) &&
        event.target === document.body
      ) {
        const [firstInput] = getInputs(container);
        if (firstInput) {
          firstInput.focus();
          firstInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [container]);
};

export default ResultForm;
