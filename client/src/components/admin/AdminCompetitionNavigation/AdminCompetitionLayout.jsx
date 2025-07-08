import { AppBar, Box } from "@mui/material";
import AdminCompetitionToolbar from "./AdminCompetitionToolbar";

function AdminCompetitionLayout({ competition, children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="sticky">
        <AdminCompetitionToolbar competition={competition} />
      </AppBar>
      <Box
        sx={{
          position: "relative", // For LinearProgress
          overflowY: "auto", // Allow scrolling
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AdminCompetitionLayout;
