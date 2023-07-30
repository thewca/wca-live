import { useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import CompetitionDrawerContent from "./CompetitionDrawerContent";
import CompetitionToolbar from "./CompetitionToolbar";

const DRAWER_WIDTH = 250;

const styles = {
  appBarShift: {
    width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
    ml: { lg: `${DRAWER_WIDTH}px` },
  },
};

function CompetitionLayout({ competition, children }) {
  const lgScreen = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const [mobileOpen, setMobileOpen] = useState(false);

  // See https://mui.com/material-ui/react-drawer/#swipeable
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <AppBar position="sticky" sx={styles.appBarShift}>
        {competition && (
          <CompetitionToolbar
            competition={competition}
            onMenuClick={() => setMobileOpen(true)}
          />
        )}
      </AppBar>
      {lgScreen ? (
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": { width: { lg: DRAWER_WIDTH } },
          }}
        >
          {competition && (
            <CompetitionDrawerContent competition={competition} />
          )}
        </Drawer>
      ) : (
        <SwipeableDrawer
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          onClick={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": { width: { lg: DRAWER_WIDTH } },
          }}
          disableBackdropTransition={!iOS}
          disableDiscovery={iOS}
        >
          {competition && (
            <CompetitionDrawerContent competition={competition} />
          )}
        </SwipeableDrawer>
      )}
      <Box
        sx={{
          position: "relative", // For LinearProgress
          overflowY: "auto",
          py: { xs: 2, md: 3 },
          px: { xs: 1, md: 3 },
          ...styles.appBarShift,
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default CompetitionLayout;
