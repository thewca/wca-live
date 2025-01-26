import { Link } from "react-router-dom";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import TvIcon from "@mui/icons-material/Tv";
import PrintIcon from "@mui/icons-material/Print";
import { appUrl } from "../../lib/urls";
import { forecastViewEnabled } from "../../lib/result";

function RoundToolbar({ round, competitionId, forecastView, setForecastView }) {
  const mdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <Grid item container alignItems="center">
      <Grid item>
        <Typography variant="h5">
          {round.competitionEvent.event.name} - {round.name}
        </Typography>
      </Grid>
      <Grid item style={{ flexGrow: 1 }} />
      {mdScreen && (
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={forecastView}
                onChange={(event) => setForecastView(event.target.checked)}
              />
            }
            label="Forecast View"
            labelPlacement='start'
            disabled={!forecastViewEnabled(round)} />
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
          <Tooltip title="Projector view" placement="top">
            <IconButton
              component={Link}
              to={`/competitions/${competitionId}/rounds/${round.id}/projector`}
              size="large"
            >
              <TvIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      )}
    </Grid>
  );
}

export default RoundToolbar;
