import React, { useState, useEffect, useMemo } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { toInt, setAt, preventDefault, times } from '../../../logic/utils';

const reformatInput = input => {
  if (input.includes('f') || input.includes('/')) return 'DNF';
  if (input.includes('s') || input.includes('*')) return 'DNS';
  const number = toInt(input.replace(/\D/g, '')) || 0;
  if (number === 0) return '';
  const str = '00000000' + number.toString().slice(0, 8);
  return (`${str.slice(-8, -6)}:${str.slice(-6, -4)}:${str.slice(-4, -2)}.${str.slice(-2)}`).replace(/^[0:]*(?!\.)/g, '');
};

const inputToCentiseconds = input => {
  if (input === '') return 0;
  if (input === 'DNF') return -1;
  if (input === 'DNS') return -2;
  const num = toInt(input.replace(/\D/g, '')) || 0;
  return Math.floor(num / 1000000) * 360000 + Math.floor((num % 1000000) / 10000) * 6000 + Math.floor((num % 10000) / 100) * 100 + (num % 100);
};

const centisecondsToInput = centiseconds => {
  if (centiseconds === 0) return '';
  if (centiseconds === -1) return 'DNF';
  if (centiseconds === -2) return 'DNS';
  return new Date(centiseconds * 10).toISOString().substr(11, 11).replace(/^[0:]*(?!\.)/g, '');
};

const normalize = input => centisecondsToInput(inputToCentiseconds(input));

const TimeField = ({ initialValue, onChange, ...props }) => {
  const [input, setInput] = useState(centisecondsToInput(initialValue));

  useEffect(() => {
    setInput(centisecondsToInput(initialValue));
  }, [initialValue]);

  return (
    <TextField
      {...props}
      /* inputProps={{ style: { textAlign: 'right', fontSize: '2em' }}} */
      fullWidth
      variant="outlined"
      value={input}
      onChange={event => setInput(reformatInput(event.target.value))}
      onBlur={() => {
        const attempt = input === normalize(input) ? inputToCentiseconds(input) : 0;
        onChange(attempt);
        setInput(centisecondsToInput(attempt));
      }}
    />
  );
};

const ResultForm = ({ onSubmit, results, format }) => {
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
          <TimeField
            inputRef={refs[index + 1]}
            label={`Attempt ${index + 1}`}
            initialValue={attempt}
            disabled={!result}
            onChange={value => setAttempts(setAt(attempts, index, value))}
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
