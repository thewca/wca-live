import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

import { toInt } from '../../../../lib/utils';

const CubesField = ({ initialValue, onValue, ...props }) => {
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
      value={value || ''}
      spellCheck={false}
      onChange={(event) => {
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

export default CubesField;
