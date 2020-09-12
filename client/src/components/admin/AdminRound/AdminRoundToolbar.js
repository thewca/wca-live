import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, IconButton, Tooltip, Typography } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CheckIcon from '@material-ui/icons/Check';
import PrintIcon from '@material-ui/icons/Print';
import AddCompetitorDialog from './AddCompetitorDialog';
import { appUrl } from '../../../lib/urls';

function roundDescription(round) {
  const enteredResults = round.results.filter(
    (result) => result.attempts.length > 0
  );
  return `${enteredResults.length} of ${round.results.length} entered`;
}

function AdminRoundToolbar({ round, competitionId }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      <Grid container alignItems="center">
        <Grid item>
          <Typography variant="h5">
            {round.competitionEvent.event.name} - {round.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {roundDescription(round)}
          </Typography>
        </Grid>
        <Grid item style={{ flexGrow: 1 }} />
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
          <Tooltip title="Add competitor" placement="top">
            <IconButton onClick={() => setAddDialogOpen(true)}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Double-check" placement="top">
            <IconButton
              component={RouterLink}
              to={`/admin/competitions/${competitionId}/rounds/${round.id}/doublecheck`}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <AddCompetitorDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        roundId={round.id}
      />
    </>
  );
}

export default AdminRoundToolbar;
