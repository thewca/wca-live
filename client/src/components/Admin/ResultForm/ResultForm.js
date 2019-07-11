import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { toInt, setAt } from '../../../logic/utils';

const ResultForm = ({ onSubmit }) => {
  const [personId, setPersonId] = useState(null);
  const [attempts, setAttempts] = useState([null, null, null, null, null]);
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          variant="outlined"
          label="Competitor ID"
          value={personId || ""}
          onChange={event => setPersonId(toInt(event.target.value))}
        />
      </Grid>
      {[1, 2, 3, 4, 5].map(n => (
        <Grid item xs={12} key={n}>
          <TextField
            fullWidth
            variant="outlined"
            label={`Attempt ${n}`}
            value={attempts[n - 1] || ""}
            onChange={event => setAttempts(setAt(attempts, n - 1, toInt(event.target.value)))}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="primary"
          disabled={!personId}
          onClick={() => onSubmit({ personId, attempts })}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default ResultForm;
