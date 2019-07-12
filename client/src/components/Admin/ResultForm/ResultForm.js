import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { toInt, setAt, preventDefault } from '../../../logic/utils';

const ResultForm = ({ onSubmit, results }) => {
  const [personId, setPersonId] = useState(null);
  const [attempts, setAttempts] = useState([0, 0, 0, 0, 0]);
  const result = personId && results.find(result => result.person.id === personId.toString());

  return (
    <form onSubmit={preventDefault(() => onSubmit({ personId, attempts }))}>
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
              setAttempts(result ? result.attempts : [0, 0, 0, 0, 0]); // TODO: change hardcoded 5 attempts.
            }}
          />
        </Grid>
        {attempts.map((attempt, index) => (
          <Grid item xs={12} key={index}>
            <TextField
              fullWidth
              variant="outlined"
              label={`Attempt ${index + 1}`}
              value={attempt || ""}
              disabled={!result}
              onChange={event => setAttempts(setAt(attempts, index, toInt(event.target.value) || 0))}
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
