import React, { Fragment, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ResultsTable from '../ResultsTable/ResultsTable';
import ResultDialog from '../ResultDialog/ResultDialog';

const RoundView = ({ round, competitionId }) => {
  const [selectedResult, setSelectedResult] = useState(null);

  const handleResultClick = useCallback((result, event) => {
    setSelectedResult(result);
  }, []);

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
            <Tooltip title="Projector view" placement="left">
              <IconButton
                component={Link}
                to={`/competitions/${competitionId}/rounds/${round.id}/projector`}
              >
                <Icon>tv</Icon>
              </IconButton>
            </Tooltip>
          </Grid>
        </Hidden>
      </Grid>
      <ResultsTable
        results={round.results}
        format={round.format}
        eventId={round.event.id}
        competitionId={competitionId}
        onResultClick={handleResultClick}
      />
      <Hidden mdUp>
        <ResultDialog
          result={selectedResult}
          format={round.format}
          eventId={round.event.id}
          competitionId={competitionId}
          onClose={() => setSelectedResult(null)}
        />
      </Hidden>
    </Fragment>
  );
};

export default RoundView;
