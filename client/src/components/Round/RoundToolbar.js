import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Hidden,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core';
import TvIcon from '@material-ui/icons/Tv';
import PrintIcon from '@material-ui/icons/Print';
import { appUrl } from '../../lib/urls';

function RoundToolbar({ round, competitionId }) {
  return (
    <Grid item container alignItems="center">
      <Grid item>
        <Typography variant="h5">
          {round.competitionEvent.event.name} - {round.name}
        </Typography>
      </Grid>
      <Grid item style={{ flexGrow: 1 }} />
      <Hidden smDown>
        <Grid item>
          <Tooltip title="PDF" placement="top">
            <IconButton
              component="a"
              target="_blank"
              href={appUrl(`/pdf/rounds/${round.id}`)}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Projector view" placement="top">
            <IconButton
              component={Link}
              to={`/competitions/${competitionId}/rounds/${round.id}/projector`}
            >
              <TvIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Hidden>
    </Grid>
  );
}

export default RoundToolbar;
