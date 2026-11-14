import { Box } from "@mui/material";

function CubingIcon({ eventId, small = false, ...props }) {
  // @cubing/icons v1 includes FTO under its original unofficial class name.
  const iconClass = eventId === "fto" ? "unofficial-fto" : `event-${eventId}`;

  return (
    <Box
      component="span"
      className={`cubing-icon ${iconClass}`}
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
