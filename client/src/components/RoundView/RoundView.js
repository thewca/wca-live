import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TvIcon from '@material-ui/icons/Tv';
import PrintIcon from '@material-ui/icons/Print';

import RoundResults from '../RoundResults/RoundResults';

const RoundView = ({ round, competitionId }) => {
  return (
    <Fragment>
      <Grid container alignItems="center">
        <Grid item>
          <Typography variant="h5">
            {round.event.name} - {round.name}
          </Typography>
        </Grid>
        <Grid item style={{ flexGrow: 1 }} />
        <Hidden smDown>
          <Grid item>
            <Tooltip title="PDF" placement="top">
              <IconButton
                component="a"
                target="_blank"
                href={`/pdfs/competitions/${competitionId}/rounds/${round.id}`}
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
      <RoundResults
        results={round.results}
        format={round.format}
        eventId={round.event.id}
        competitionId={competitionId}
      />
    </Fragment>
  );
};

export default RoundView;
