import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { AppBar, Drawer, Hidden, SwipeableDrawer } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import classNames from 'classnames';
import Error from '../Error/Error';
import CompetitionNavigation from './CompetitionNavigation';
import CompetitionDrawerContent from './CompetitionDrawerContent';
import Loading from '../Loading/Loading';
import CompetitionToolbar from './CompetitionToolbar';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          name
          label
          open
        }
      }
      access {
        canScoretake
      }
    }

    currentUser {
      id
      name
      avatar {
        thumbUrl
      }
    }
  }
`;

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

function Competition() {
  const classes = useStyles();
  const { id } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data, error, loading } = useQuery(COMPETITION_QUERY, {
    variables: { id: id },
    // Eventually update rounds data (open, label).
    pollInterval: 60 * 1000,
  });

  if (error) return <Error error={error} />;

  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  const competition = data ? data.competition : null;

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
            currentUser={data && data.currentUser}
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
        {loading && <Loading />}
        <CompetitionNavigation competitionId={id} />
      </div>
    </>
  );
}

export default Competition;
