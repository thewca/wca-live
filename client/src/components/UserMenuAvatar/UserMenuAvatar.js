import React, { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SignOutMenuItem from './SignOutMenuItem';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

const useStyles = makeStyles((theme) => ({
  menuList: {
    minWidth: 200,
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
}));

function UserMenuAvatar({ user }) {
  const classes = useStyles();
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorEl = useRef();

  return (
    <>
      <IconButton ref={anchorEl} onClick={() => setMenuOpen(true)} size="small">
        <Avatar alt={user.name} src={user.avatar.thumbUrl} size="small" />
      </IconButton>
      <Menu
        open={menuOpen}
        onClick={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
        classes={{ list: classes.menuList }}
      >
        <MenuItem component={RouterLink} to="/account">
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          Account
        </MenuItem>
        <MenuItem component={RouterLink} to="/my-competitions">
          <ListItemIcon>
            <AssignmentIndIcon />
          </ListItemIcon>
          My competitions
        </MenuItem>
        <Divider className={classes.divider} />
        <SignOutMenuItem />
      </Menu>
    </>
  );
}

export default UserMenuAvatar;
