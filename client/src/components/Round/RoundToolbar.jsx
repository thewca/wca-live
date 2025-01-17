import { Link } from "react-router-dom";
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import TvIcon from "@mui/icons-material/Tv";
import PrintIcon from "@mui/icons-material/Print";
import ForecastIcon from "@mui/icons-material/ViewList";
import { appUrl } from "../../lib/urls";
import { forecastViewDisabled } from "./Round";

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
          {!forecastViewDisabled(round) &&
            (<Tooltip title="Forecast view" placement="top">
              <IconButton
                component="a"
                target="_blank"
                onClick={() => setForecastView(!forecastView)}
              >
                <ForecastIcon />
              </IconButton>
            </Tooltip>)}
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
