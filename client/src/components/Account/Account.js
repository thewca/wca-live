import React from 'react';
import { Box } from '@material-ui/core';
import OneTimeCode from '../OneTimeCode/OneTimeCode';

function Account() {
  // It's pretty boring right now, but there's more to come.
  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <OneTimeCode />
    </Box>
  );
}

export default Account;
