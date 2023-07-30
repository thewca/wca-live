import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PrintIcon from "@mui/icons-material/Print";
import AddCompetitorDialog from "./AddCompetitorDialog";
import QuitNoShowsDialog from "./QuitNoShowsDialog";
import { appUrl } from "../../../lib/urls";

function roundDescription(round) {
  const enteredResults = round.results.filter(
    (result) => result.attempts.length > 0
  );
  return `${enteredResults.length} of ${round.results.length} entered`;
}

function AdminRoundToolbar({ round, competitionId }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [quitNoShowsOpen, setQuitNoShowsOpen] = useState(false);

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
              size="large"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add competitor" placement="top">
            <IconButton onClick={() => setAddDialogOpen(true)} size="large">
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Double-check" placement="top">
            <IconButton
              component={RouterLink}
              to={`/admin/competitions/${competitionId}/rounds/${round.id}/double-check`}
              size="large"
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
          {/* For subsequent rounds there are few no-shows and they may
              be replaced with competitors from the previous round, so
              we enable the bulk quit only for the first round */}
          {round.number === 1 && (
            <Tooltip title="Bulk quit no-shows" placement="top">
              <IconButton onClick={() => setQuitNoShowsOpen(true)} size="large">
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <AddCompetitorDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        roundId={round.id}
      />
      <QuitNoShowsDialog
        open={quitNoShowsOpen}
        onClose={() => setQuitNoShowsOpen(false)}
        results={round.results}
        roundId={round.id}
      />
    </>
  );
}

export default AdminRoundToolbar;
