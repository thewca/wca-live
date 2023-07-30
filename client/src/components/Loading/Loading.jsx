import { Fade, LinearProgress } from "@mui/material";

/* Waits 800ms before showing LinearProgress. */
function Loading() {
  return (
    <Fade in={true} style={{ transitionDelay: "800ms" }}>
      <LinearProgress
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
        }}
      />
    </Fade>
  );
}

export default Loading;
