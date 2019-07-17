import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import AttemptField from '../AttemptField/AttemptField';
import { toInt, setAt, preventDefault, times } from '../../../logic/utils';
import { meetsCutoff } from '../../../logic/results';

const ResultForm = ({ onSubmit, results, format, eventId, timeLimit, cutoff }) => {
  const { solveCount } = format;
  const [personId, setPersonId] = useState(null);
  const [attempts, setAttempts] = useState(times(solveCount, () => 0));
  const rootRef = useRef(null);
  const result = personId && results.find(result => result.person.id === personId.toString());

  const handleSubmit = preventDefault(() => {
    onSubmit({ personId, attempts });
    const personIdInput = rootRef.current.getElementsByTagName('input')[0];
    personIdInput.focus();
    personIdInput.select();
  });

  useEffect(() => {
    const handleKeyPress = event => {
      const inputs = Array.from(rootRef.current.querySelectorAll('input, button'));
      const mod = n => (n + inputs.length) % inputs.length;
      const index = inputs.findIndex(input => event.target === input);
      if (index === -1) return;
      if (event.key === 'ArrowUp') {
        const previousElement = inputs[mod(index - 1)];
        previousElement.focus();
        previousElement.select && previousElement.select();
      } else if (event.key === 'ArrowDown') {
        const nextElement = inputs[mod(index + 1)];
        nextElement.focus();
        nextElement.select && nextElement.select();
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  return (
    <Grid container spacing={1} ref={rootRef}>
      <Grid item xs={12} style={{ marginBottom: 16 }}>
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          label="Competitor ID"
          value={personId || ""}
          helperText={result ? result.person.name : ' '}
          onChange={event => {
            const personId = toInt(event.target.value);
            const result = personId && results.find(result => result.person.id === personId.toString());
            setPersonId(personId);
            setAttempts(result ? result.attempts : times(solveCount, () => 0));
          }}
        />
      </Grid>
      {attempts.map((attempt, index) => (
        <Grid item xs={12} key={index}>
          <AttemptField
            eventId={eventId}
            label={`Attempt ${index + 1}`}
            initialValue={attempt}
            disabled={!result}
            onValue={value => {
              const updatedValue = timeLimit && value > timeLimit.centiseconds ? -1 : value;
              const updatedAttempts = setAt(attempts, index, updatedValue);
              setAttempts(
                meetsCutoff(updatedAttempts, cutoff, eventId)
                  ? updatedAttempts
                  : updatedAttempts.map((attempt, index) => index < cutoff.numberOfAttempts ? attempt : 0)
              );
            }}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          type="submit"
          variant="outlined"
          color="primary"
          disabled={!result}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default ResultForm;
