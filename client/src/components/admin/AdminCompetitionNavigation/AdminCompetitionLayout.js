import { AppBar, Box } from '@mui/material';
import AdminCompetitionToolbar from './AdminCompetitionToolbar';

function AdminCompetitionLayout({ competition, children }) {
  return (
    <>
      <AppBar position="sticky">
        <AdminCompetitionToolbar competition={competition} />
      </AppBar>
      <Box
        sx={{
          position: 'relative', // For LinearProgress
          p: 3,
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default AdminCompetitionLayout;
