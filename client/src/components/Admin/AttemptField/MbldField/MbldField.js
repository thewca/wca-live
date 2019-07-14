import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';

import NumberField from '../NumberField/NumberField';
import TimeField from '../TimeField/TimeField';

import { decodeMbldResult, encodeMbldResult, validateMbldResult } from '../../../../logic/results';

const MbldField = ({ initialValue, onValue, disabled, ...props }) => {
  const [result, setResult] = useState(decodeMbldResult(initialValue));

  useEffect(() => {
    setResult(decodeMbldResult(initialValue));
  }, [initialValue]);

  const handleValue = result => {
    const updatedResult = validateMbldResult(result);
    setResult(updatedResult);
    onValue(encodeMbldResult(updatedResult));
  };

  return (
    <Grid container direction="row" spacing={1}>
      <Grid item xs={2}>
        <NumberField
          initialValue={result.solved}
          onValue={solved => handleValue({ ...result, solved })}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={2}>
        <NumberField
          initialValue={result.attempted}
          onValue={attempted => handleValue({ ...result, attempted })}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={8}>
        <TimeField
          initialValue={result.centiseconds}
          onValue={centiseconds => handleValue({ ...result, centiseconds })}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default MbldField;
