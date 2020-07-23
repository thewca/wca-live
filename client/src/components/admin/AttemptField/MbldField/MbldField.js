import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

import { dnfKeys, dnsKeys } from '../keybindings';
import TimeField from '../TimeField/TimeField';
import CubesField from '../CubesField/CubesField';
// TODO: rename to attempt result?
import { validateMbldAttempt } from '../../../../lib/attempts';
import {
  decodeMbldAttemptResult,
  encodeMbldAttemptResult,
} from '../../../../lib/attempt-result';

const MbldField = ({ initialValue, onValue, disabled, label }) => {
  const [prevInitialValue, setPrevInitialValue] = useState(null);
  const [decodedValue, setDecodedValue] = useState(
    decodeMbldAttemptResult(initialValue)
  );

  /* Sync local value when initial value changes. See AttemptField for detailed description. */
  if (prevInitialValue !== initialValue) {
    setDecodedValue(decodeMbldAttemptResult(initialValue));
    setPrevInitialValue(initialValue);
  }

  const handleDecodedValueChange = (decodedValue) => {
    const updatedDecodedValue = validateMbldAttempt(decodedValue);
    if (encodeMbldAttemptResult(updatedDecodedValue) !== initialValue) {
      onValue(encodeMbldAttemptResult(updatedDecodedValue));
      /* Once we emit the change, reflect the initial state. */
      setDecodedValue(decodeMbldAttemptResult(initialValue));
    } else {
      setDecodedValue(updatedDecodedValue);
    }
  };

  const handleAnyInput = (event) => {
    const key = event.nativeEvent.data;
    if (dnfKeys.includes(key)) {
      handleDecodedValueChange(decodeMbldAttemptResult(-1));
      event.preventDefault();
    } else if (dnsKeys.includes(key)) {
      handleDecodedValueChange(decodeMbldAttemptResult(-2));
      event.preventDefault();
    }
  };

  return (
    <Grid container direction="row" spacing={1} onInputCapture={handleAnyInput}>
      <Grid item xs={2}>
        <CubesField
          initialValue={decodedValue.solved}
          onValue={(solved) =>
            handleDecodedValueChange({ ...decodedValue, solved })
          }
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={2}>
        <CubesField
          initialValue={decodedValue.attempted}
          onValue={(attempted) =>
            handleDecodedValueChange({ ...decodedValue, attempted })
          }
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={8}>
        <TimeField
          label={label}
          initialValue={decodedValue.centiseconds}
          onValue={(centiseconds) =>
            handleDecodedValueChange({ ...decodedValue, centiseconds })
          }
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default MbldField;
