import React, { useState } from 'react';
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

const ResultForm = ({ onSubmit, results, format }) => {
  const { solveCount } = format;
  const [personId, setPersonId] = useState(null);
  const [attemptInputs, setAttemptInputs] = useState(times(solveCount, () => ''));
  const result = personId && results.find(result => result.person.id === personId.toString());

  const handleSubmit = preventDefault(() => {
    onSubmit({
      personId,
      attempts: attemptInputs.map(inputToCentiseconds),
    })
  });

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1}>
        <Grid item xs={12} style={{ marginBottom: 16 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Competitor ID"
            value={personId || ""}
            helperText={result ? result.person.name : ' '}
            onChange={event => {
              const personId = toInt(event.target.value);
              const result = personId && results.find(result => result.person.id === personId.toString());
              setPersonId(personId);
              setAttemptInputs(result ? result.attempts.map(centisecondsToInput) : times(solveCount, () => ''));
            }}
          />
        </Grid>
        {attemptInputs.map((attemptInput, index) => (
          <Grid item xs={12} key={index}>
            <TextField
              /* inputProps={{ style: { textAlign: 'right', fontSize: '2em' }}} */
              fullWidth
              variant="outlined"
              label={`Attempt ${index + 1}`}
              value={attemptInput || ""}
              disabled={!result}
              onChange={event => setAttemptInputs(setAt(attemptInputs, index, reformatInput(event.target.value)))}
              /* onBlur={() => setAttemptInputs(setAt(attemptInputs, index, normalize(attemptInput)))} */
              error={attemptInput !== normalize(attemptInput)}
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            disabled={!result}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ResultForm;
