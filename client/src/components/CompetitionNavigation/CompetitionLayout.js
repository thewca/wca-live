import React, { useState } from 'react';
import { AppBar, Drawer, Hidden, SwipeableDrawer } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import classNames from 'classnames';
import CompetitionDrawerContent from './CompetitionDrawerContent';
import CompetitionToolbar from './CompetitionToolbar';

const DRAWER_WIDTH = 250;

const useStyles = makeStyles((theme) => ({
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  appBarShift: {
    [theme.breakpoints.up('lg')]: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: DRAWER_WIDTH,
    },
  },
  drawer: {
    [theme.breakpoints.up('lg')]: {
      width: DRAWER_WIDTH,
    },
  },
  content: {
    position: 'relative', // For LinearProgress
    overflowY: 'auto',
    padding: theme.spacing(2, 1),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    },
  },
}));

function CompetitionLayout({ competition, children }) {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);

  // See https://material-ui.com/components/drawers/#swipeable
  const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <AppBar
        position="sticky"
        className={classNames(classes.appBar, classes.appBarShift)}
      >
        {competition && (
          <CompetitionToolbar
            competition={competition}
            onMenuClick={() => setMobileOpen(true)}
          />
        )}
      </AppBar>
      <Hidden lgUp>
        <SwipeableDrawer
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          onClick={() => setMobileOpen(false)}
          classes={{ paper: classes.drawer }}
          disableBackdropTransition={!iOS}
          disableDiscovery={iOS}
        >
          {competition && (
            <CompetitionDrawerContent competition={competition} />
          )}
        </SwipeableDrawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer variant="permanent" classes={{ paper: classes.drawer }}>
          {competition && (
            <CompetitionDrawerContent competition={competition} />
          )}
        </Drawer>
      </Hidden>
      <div className={classNames(classes.content, classes.appBarShift)}>
        {children}
      </div>
    </>
  );
}

export default CompetitionLayout;
