import { Box } from "@mui/material";

function CubingIcon({ eventId, small = false, ...props }) {
  return (
    <Box
      component="span"
      className={`cubing-icon event-${eventId}`}
      sx={{
        color: (theme) =>
          theme.palette.mode === "dark" ? "#fff" : "rgba(0, 0, 0, 0.54)",
        fontSize: small ? 16 : 24,
      }}
      {...props}
    />
  );
}

export default CubingIcon;
