import React, { useState, useEffect, useMemo } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import AttemptField from '../AttemptField/AttemptField';
import { toInt, setAt, preventDefault, times } from '../../../logic/utils';

const ResultForm = ({ onSubmit, results, format, eventId }) => {
  const { solveCount } = format;
  const [personId, setPersonId] = useState(null);
  const [attempts, setAttempts] = useState(times(solveCount, () => 0));
  const refs = useMemo(() =>
    times(solveCount + 2, () => React.createRef())
  , [solveCount]);
  const result = personId && results.find(result => result.person.id === personId.toString());

  const handleSubmit = preventDefault(() => {
    onSubmit({ personId, attempts });
    refs[0].current.focus();
    refs[0].current.select();
  });

  useEffect(() => {
    const handleKeyPress = event => {
      const mod = n => (n + refs.length) % refs.length;
      const index = refs.findIndex(ref => event.target === ref.current);
      if (index === -1) return;
      if (event.key === 'ArrowUp') {
        const previousElement = refs[mod(index - 1)].current;
        previousElement.focus();
        previousElement.select && previousElement.select();
      } else if (event.key === 'ArrowDown') {
        const nextElement = refs[mod(index + 1)].current;
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
    <Grid container spacing={1}>
      <Grid item xs={12} style={{ marginBottom: 16 }}>
        <TextField
          inputRef={refs[0]}
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
            inputRef={refs[index + 1]}
            label={`Attempt ${index + 1}`}
            initialValue={attempt}
            disabled={!result}
            onValue={value => setAttempts(setAt(attempts, index, value))}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          buttonRef={refs[solveCount + 1]}
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
