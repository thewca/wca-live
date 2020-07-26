import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { DNF_KEYS, DNS_KEYS } from './keybindings';
import { toInt } from '../../../lib/utils';
import {
  SKIPPED_VALUE,
  DNF_VALUE,
  DNS_VALUE,
  autocompleteFmAttemptResult,
} from '../../../lib/attempt-result';

function numberToInput(number) {
  if (number === SKIPPED_VALUE) return '';
  if (number === DNF_VALUE) return 'DNF';
  if (number === DNS_VALUE) return 'DNS';
  return number.toString();
}

function FmField({ value, onChange, label, disabled, TextFieldProps = {} }) {
  const [prevValue, setPrevValue] = useState(value);
  const [draftValue, setDraftValue] = useState(value);

  // Sync draft value when the upstream value changes. See AttemptResultField for detailed description.
  if (prevValue !== value) {
    setDraftValue(value);
    setPrevValue(value);
  }

  function handleChange(event) {
    const key = event.nativeEvent.data;
    if (DNF_KEYS.includes(key)) {
      setDraftValue(DNF_VALUE);
    } else if (DNS_KEYS.includes(key)) {
      setDraftValue(DNS_VALUE);
    } else {
      const newValue =
        toInt(event.target.value.replace(/\D/g, '')) || SKIPPED_VALUE;
      setDraftValue(newValue);
    }
  }

  function handleBlur() {
    onChange(autocompleteFmAttemptResult(draftValue));
    // Once we emit the change, reflect the initial state.
    setDraftValue(value);
  }

  return (
    <TextField
      {...TextFieldProps}
      label={label}
      disabled={disabled}
      spellCheck={false}
      value={numberToInput(draftValue)}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

export default FmField;
