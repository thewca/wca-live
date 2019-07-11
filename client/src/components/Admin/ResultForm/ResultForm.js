import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { toInt, setAt } from '../../../logic/utils';

const ResultForm = ({ onSubmit, results }) => {
  const [personId, setPersonId] = useState(null);
  const [attempts, setAttempts] = useState([0, 0, 0, 0, 0]);
  const result = personId && results.find(result => result.person.registrantId === personId.toString());

  return (
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
            const result = personId && results.find(result => result.person.registrantId === personId.toString());
            setPersonId(personId);
            setAttempts(result ? result.attempts : [0, 0, 0, 0, 0]);
          }}
        />
      </Grid>
      {[1, 2, 3, 4, 5].map(n => (
        <Grid item xs={12} key={n}>
          <TextField
            fullWidth
            variant="outlined"
            label={`Attempt ${n}`}
            value={attempts[n - 1] || ""}
            disabled={!result}
            onChange={event => setAttempts(setAt(attempts, n - 1, toInt(event.target.value)))}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="primary"
          disabled={!result}
          onClick={() => onSubmit({ personId, attempts })}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default ResultForm;
