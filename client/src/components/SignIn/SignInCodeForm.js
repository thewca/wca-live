import React, { useState } from 'react';
import { TextField, IconButton } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

function isValidCode(code) {
  return /^\d+-\d{6}$/.test(code);
}

function SignInCodeForm({ onSubmit, disabled = false }) {
  const [code, setCode] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(code);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        variant="outlined"
        label="Code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <IconButton type="submit" disabled={disabled || !isValidCode(code)}>
              <ArrowForwardIcon />
            </IconButton>
          ),
        }}
      />
    </form>
  );
}

export default SignInCodeForm;
