import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

import { dnfKeys, dnsKeys } from '../keybindings';
import { toInt } from '../../../../logic/utils';
import { roundOver10Mins } from '../../../../logic/stats';

const reformatInput = input => {
  const number = toInt(input.replace(/\D/g, '')) || 0;
  if (number === 0) return '';
  const str = '00000000' + number.toString().slice(0, 8);
  const [, hh, mm, ss, cc] = str.match(/(\d\d)(\d\d)(\d\d)(\d\d)$/);
  return `${hh}:${mm}:${ss}.${cc}`.replace(/^[0:]*(?!\.)/g, '');
};

const inputToCentiseconds = input => {
  if (input === '') return 0;
  if (input === 'DNF') return -1;
  if (input === 'DNS') return -2;
  const num = toInt(input.replace(/\D/g, '')) || 0;
  return (
    Math.floor(num / 1000000) * 360000 +
    Math.floor((num % 1000000) / 10000) * 6000 +
    Math.floor((num % 10000) / 100) * 100 +
    (num % 100)
  );
};

const centisecondsToInput = centiseconds => {
  if (centiseconds === 0) return '';
  if (centiseconds === -1) return 'DNF';
  if (centiseconds === -2) return 'DNS';
  return new Date(centiseconds * 10)
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
};

const validateTimeResult = centiseconds => {
  return roundOver10Mins(centiseconds);
};

const normalize = input => centisecondsToInput(inputToCentiseconds(input));

const TimeField = ({ initialValue, onValue, ...props }) => {
  const [prevInitialValue, setPrevInitialValue] = useState(null);
  const [input, setInput] = useState(centisecondsToInput(initialValue));

  /* Sync local value when initial value changes. See AttemptField for detailed description. */
  if (prevInitialValue !== initialValue) {
    setInput(centisecondsToInput(initialValue));
    setPrevInitialValue(initialValue);
  }

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={input}
      spellCheck={false}
      onKeyDown={event => {
        if (dnfKeys.includes(event.key)) {
          setInput('DNF');
          event.preventDefault();
        } else if (dnsKeys.includes(event.key)) {
          setInput('DNS');
          event.preventDefault();
        }
      }}
      onChange={event => setInput(reformatInput(event.target.value))}
      onBlur={() => {
        const attempt =
          input === normalize(input)
            ? validateTimeResult(inputToCentiseconds(input))
            : 0;
        onValue(attempt);
        /* Once we emit the change, reflect the initial state. */
        setInput(centisecondsToInput(initialValue));
      }}
    />
  );
};

export default TimeField;
