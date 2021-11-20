import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { MenuItem, ListItemIcon } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { clearToken } from '../../lib/auth';

function SignOutMenuItem() {
  const apolloClient = useApolloClient();
  const navigate = useNavigate();

  function handleSignOut() {
    clearToken();
    navigate('/');
    apolloClient.resetStore();
  }

  return (
    <MenuItem onClick={handleSignOut}>
      <ListItemIcon>
        <ExitToAppIcon />
      </ListItemIcon>
      Sign out
    </MenuItem>
  );
}

export default SignOutMenuItem;
