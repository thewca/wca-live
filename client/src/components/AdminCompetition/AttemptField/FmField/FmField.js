import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';

import { toInt } from '../../../../logic/utils';

const numberToInput = number => {
  if (number === 0) return '';
  if (number === -1) return 'DNF';
  if (number === -2) return 'DNS';
  return number.toString();
};

const validateFmResult = number => {
  if (number > 80) return -1;
  return number;
};

const FmField = ({ initialValue, onValue, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={numberToInput(value)}
      onChange={event => {
        const input = event.target.value;
        if (input.includes('d') || input.includes('/')) {
          setValue(-1);
        } else if (input.includes('s') || input.includes('*')) {
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
