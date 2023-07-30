import { useState } from 'react';
import { Grid } from '@mui/material';
import { DNF_KEYS, DNS_KEYS } from './keybindings';
import TimeField from './TimeField';
import CubesField from './CubesField';
import {
  decodeMbldAttemptResult,
  encodeMbldAttemptResult,
  autocompleteMbldDecodedValue,
  DNF_VALUE,
  DNS_VALUE,
} from '../../../lib/attempt-result';

function MbldField({ value, onChange, disabled, label, TextFieldProps = {} }) {
  const [prevValue, setPrevValue] = useState(value);
  const [decodedDraftValue, setDecodedDraftValue] = useState(
    decodeMbldAttemptResult(value)
  );

  // Sync draft value when the upstream value changes. See AttemptResultField for detailed description.
  if (prevValue !== value) {
    setDecodedDraftValue(decodeMbldAttemptResult(value));
    setPrevValue(value);
  }

  function handleDecodedValueChange(decodedDraftValue) {
    const updatedDecodedValue = autocompleteMbldDecodedValue(decodedDraftValue);
    if (encodeMbldAttemptResult(updatedDecodedValue) !== value) {
      onChange(encodeMbldAttemptResult(updatedDecodedValue));
      // Once we emit the change, reflect the initial state.
      setDecodedDraftValue(decodeMbldAttemptResult(value));
    } else {
      setDecodedDraftValue(updatedDecodedValue);
    }
  }

  function handleAnyInput(event) {
    const key = event.nativeEvent.data;
    if (DNF_KEYS.includes(key)) {
      handleDecodedValueChange(decodeMbldAttemptResult(DNF_VALUE));
      event.preventDefault();
    } else if (DNS_KEYS.includes(key)) {
      handleDecodedValueChange(decodeMbldAttemptResult(DNS_VALUE));
      event.preventDefault();
    }
  }

  return (
    <Grid container direction="row" spacing={1} onInputCapture={handleAnyInput}>
      <Grid item xs={2}>
        <CubesField
          value={decodedDraftValue.solved}
          onChange={(solved) =>
            handleDecodedValueChange({ ...decodedDraftValue, solved })
          }
          disabled={disabled}
          TextFieldProps={TextFieldProps}
        />
      </Grid>
      <Grid item xs={2}>
        <CubesField
          value={decodedDraftValue.attempted}
          onChange={(attempted) =>
            handleDecodedValueChange({ ...decodedDraftValue, attempted })
          }
          disabled={disabled}
          TextFieldProps={TextFieldProps}
        />
      </Grid>
      <Grid item xs={8}>
        <TimeField
          label={label}
          value={decodedDraftValue.centiseconds}
          onChange={(centiseconds) =>
            handleDecodedValueChange({ ...decodedDraftValue, centiseconds })
          }
          disabled={disabled}
          TextFieldProps={TextFieldProps}
        />
      </Grid>
    </Grid>
  );
}

export default MbldField;
