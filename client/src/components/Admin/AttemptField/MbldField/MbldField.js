import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import TimeField from '../TimeField/TimeField';
import { toInt } from '../../../../logic/utils';
import { decodeMbldResult, encodeMbldResult, validateMbldResult } from '../../../../logic/results';

const CubesField = ({ initialValue, onValue, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={value || ''}
      onChange={event => {
        const newValue = toInt(event.target.value.replace(/\D/g, '')) || 0;
        if (newValue <= 99) setValue(newValue);
      }}
      onBlur={() => {
        onValue(value);
        /* Once we emit the change, reflect the initial state. */
        setValue(initialValue);
      }}
    />
  );
};

const MbldField = ({ initialValue, onValue, disabled, label, ...props }) => {
  const [result, setResult] = useState(decodeMbldResult(initialValue));

  useEffect(() => {
    setResult(decodeMbldResult(initialValue));
  }, [initialValue]);

  const handleValue = result => {
    const updatedResult = validateMbldResult(result);
    if (encodeMbldResult(updatedResult) !== initialValue) {
      onValue(encodeMbldResult(updatedResult));
      /* Once we emit the change, reflect the initial state. */
      setResult(decodeMbldResult(initialValue));
    } else {
      setResult(updatedResult);
    }
  };

  const handleAnyInputChange = event => {
    const input = event.target.value;
    if (input.includes('f') || input.includes('/')) {
      handleValue({ solved: 0, attempted: 0, centiseconds: -1 });
    } else if (input.includes('s') || input.includes('*')) {
      handleValue({ solved: 0, attempted: 0, centiseconds: -2 });
    }
  };

  return (
    <Grid container direction="row" spacing={1} onChange={handleAnyInputChange}>
      <Grid item xs={2}>
        <CubesField
          initialValue={result.solved}
          onValue={solved => handleValue({ ...result, solved })}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={2}>
        <CubesField
          initialValue={result.attempted}
          onValue={attempted => handleValue({ ...result, attempted })}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={8}>
        <TimeField
          label={label}
          initialValue={result.centiseconds}
          onValue={centiseconds => handleValue({ ...result, centiseconds })}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default MbldField;
