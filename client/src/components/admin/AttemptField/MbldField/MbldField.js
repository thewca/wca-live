import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

import { dnfKeys, dnsKeys } from '../keybindings';
import TimeField from '../TimeField/TimeField';
import CubesField from '../CubesField/CubesField';
import {
  decodeMbldAttempt,
  encodeMbldAttempt,
  validateMbldAttempt,
} from '../../../../logic/attempts';

const MbldField = ({ initialValue, onValue, disabled, label }) => {
  const [prevInitialValue, setPrevInitialValue] = useState(null);
  const [decodedValue, setDecodedValue] = useState(
    decodeMbldAttempt(initialValue)
  );

  /* Sync local value when initial value changes. See AttemptField for detailed description. */
  if (prevInitialValue !== initialValue) {
    setDecodedValue(decodeMbldAttempt(initialValue));
    setPrevInitialValue(initialValue);
  }

  const handleDecodedValueChange = decodedValue => {
    const updatedDecodedValue = validateMbldAttempt(decodedValue);
    if (encodeMbldAttempt(updatedDecodedValue) !== initialValue) {
      onValue(encodeMbldAttempt(updatedDecodedValue));
      /* Once we emit the change, reflect the initial state. */
      setDecodedValue(decodeMbldAttempt(initialValue));
    } else {
      setDecodedValue(updatedDecodedValue);
    }
  };

  const handleAnyKeyPress = event => {
    if (dnfKeys.includes(event.key)) {
      handleDecodedValueChange(decodeMbldAttempt(-1));
      event.preventDefault();
    } else if (dnsKeys.includes(event.key)) {
      handleDecodedValueChange(decodeMbldAttempt(-2));
      event.preventDefault();
    }
  };

  return (
    <Grid container direction="row" spacing={1} onKeyPress={handleAnyKeyPress}>
      <Grid item xs={2}>
        <CubesField
          initialValue={decodedValue.solved}
          onValue={solved =>
            handleDecodedValueChange({ ...decodedValue, solved })
          }
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={2}>
        <CubesField
          initialValue={decodedValue.attempted}
          onValue={attempted =>
            handleDecodedValueChange({ ...decodedValue, attempted })
          }
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={8}>
        <TimeField
          label={label}
          initialValue={decodedValue.centiseconds}
          onValue={centiseconds =>
            handleDecodedValueChange({ ...decodedValue, centiseconds })
          }
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default MbldField;
