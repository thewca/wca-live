import React from 'react';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { MenuItem, ListItemIcon } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { clearToken } from '../../lib/auth';

function SignOutMenuItem() {
  const apolloClient = useApolloClient();
  const history = useHistory();

  function handleSignOut() {
    clearToken();
    history.push('/');
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
