import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';

import { toInt } from '../../../../logic/utils';
import { roundOver10Mins } from '../../../../logic/calculations';

const reformatInput = input => {
  if (input.includes('f') || input.includes('/')) return 'DNF';
  if (input.includes('s') || input.includes('*')) return 'DNS';
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
  const [input, setInput] = useState(centisecondsToInput(initialValue));

  useEffect(() => {
    setInput(centisecondsToInput(initialValue));
  }, [initialValue]);

  return (
    <TextField
      {...props}
      fullWidth
      variant="outlined"
      value={input}
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
