import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import SignOutMenuItem from './SignOutMenuItem';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

function UserMenuAvatar({ user }) {
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
        sx={{ minWidth: 200 }}
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
        <Divider sx={{ my: 1 }} />
        <SignOutMenuItem />
      </Menu>
    </>
  );
}

export default UserMenuAvatar;
