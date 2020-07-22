import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

import { dnfKeys, dnsKeys } from '../keybindings';
import { toInt } from '../../../../lib/utils';

const numberToInput = (number) => {
  if (number === 0) return '';
  if (number === -1) return 'DNF';
  if (number === -2) return 'DNS';
  return number.toString();
};

const validateFmResult = (number) => {
  if (number > 80) return -1;
  return number;
};

const FmField = ({ initialValue, onValue, ...props }) => {
  const [prevInitialValue, setPrevInitialValue] = useState(null);
  const [value, setValue] = useState(initialValue);

  /* Sync local value when initial value changes. See AttemptField for detailed description. */
  if (prevInitialValue !== initialValue) {
    setValue(initialValue);
    setPrevInitialValue(initialValue);
  }

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={numberToInput(value)}
      spellCheck={false}
      onChange={(event) => {
        const key = event.nativeEvent.data;
        if (dnfKeys.includes(key)) {
          setValue(-1);
        } else if (dnsKeys.includes(key)) {
          setValue(-2);
        } else {
          const newValue = toInt(event.target.value.replace(/\D/g, '')) || 0;
          setValue(newValue);
        }
      }}
      onBlur={() => {
        onValue(validateFmResult(value));
        /* Once we emit the change, reflect the initial state. */
        setValue(initialValue);
      }}
    />
  );
};

export default FmField;
