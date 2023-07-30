import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SyncIcon from '@mui/icons-material/Sync';
import ViewListIcon from '@mui/icons-material/ViewList';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';

function AdminCompetitionToolbar({ competition }) {
  const location = useLocation();

  return (
    <Toolbar sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
      <Box
        component={RouterLink}
        to={`/admin/competitions/${competition.id}`}
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          display: { xs: 'none', md: 'unset' },
        }}
      >
        <Typography variant="h6" color="inherit" component="span">
          {competition.shortName}
        </Typography>
        <Typography variant="overline" component="span" sx={{ ml: 1 }}>
          Admin
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'unset' },
        }}
      />
      <Tooltip title="Events">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={`/admin/competitions/${competition.id}`}
          size="large"
        >
          <ViewListIcon />
        </IconButton>
      </Tooltip>
      {competition.access.canManage && (
        <Tooltip title="Synchronization">
          <IconButton
            color="inherit"
            component={RouterLink}
            to={`/admin/competitions/${competition.id}/sync`}
            size="large"
          >
            <SyncIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Competitors">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={`/admin/competitions/${competition.id}/competitors`}
          size="large"
        >
          <PeopleIcon />
        </IconButton>
      </Tooltip>
      {competition.access.canManage && (
        <Tooltip title="Settings">
          <IconButton
            color="inherit"
            component={RouterLink}
            to={`/admin/competitions/${competition.id}/settings`}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Public view">
        <IconButton
          color="inherit"
          component={RouterLink}
          to={location.pathname.replace(/^\/admin/, '')}
          size="large"
        >
          <RemoveRedEyeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="My competitions">
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/my-competitions"
          size="large"
        >
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

export default AdminCompetitionToolbar;
