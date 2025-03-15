import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import {
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  ListSubheader,
} from "@mui/material";
import { Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import BuildIcon from "@mui/icons-material/Build";
import TimeAgo from "react-timeago";
import { parseISO } from "date-fns";
import Loading from "../../Loading/Loading";
import Error from "../../Error/Error";
import SynchronizeButton from "./SynchronizeButton";
import { wcaUrl, groupifierUrl, scramblesMatcherUrl } from "../../../lib/urls";

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      wcaId
      synchronizedAt
    }
  }
`;

function Synchronization() {
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <SynchronizeButton competitionId={competition.id} />
        </Grid>
        <Grid item>
          <Typography variant="caption" component="div" align="center">
            Last synchronized{" "}
            <TimeAgo date={parseISO(competition.synchronizedAt)} />.
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          Synchronization
        </Typography>
        <Typography>
          {`
          WCA Live is specifically designed to deal with competition results
          and it relies on the WCA website to provide a lot of competition information
          (like events, schedule and registered competitors). It is also meant to cooperate
          with other tools that are dedicated to do specific tasks. Synchronization
          is the process of getting the latest data from the WCA website, combining it
          with the local changes (mostly results) and saving that data back to the WCA website,
          so that other tools can use it.
          `}
        </Typography>
      </Grid>
      <Grid item>
        <Alert severity="info">
          {`Always make sure to Synchronize before using any other tool if you want it to see
          the newly entered results. If the tool modifies relevant competition data,
          synchronize afterwards to see the changes reflected here.`}
        </Alert>
      </Grid>
      <Grid item>
        <Paper>
          <List dense={true}>
            <ListSubheader sx={{ backgroundColor: "inherit" }}>
              WCA website
            </ListSubheader>
            <ListItemButton
              component="a"
              href={wcaUrl(`/competitions/${competition.wcaId}/events/edit`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText
                primary="Change round details"
                secondary="Manage events and rounds on the WCA website."
              />
            </ListItemButton>
            <ListItemButton
              component="a"
              href={wcaUrl(
                `/competitions/${competition.wcaId}/registrations/add`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText
                primary="Add competitor"
                secondary="Use a form on the WCA website to register someone during the competition (if applicable)."
              />
            </ListItemButton>
            <ListSubheader sx={{ backgroundColor: "inherit" }}>
              Additional tools
            </ListSubheader>
            <ListItemButton
              component="a"
              href={groupifierUrl(`/competitions/${competition.wcaId}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText
                primary="Groupifier"
                secondary="Manage competitor groups and print scorecards."
              />
            </ListItemButton>
            <ListItemButton
              component="a"
              href={scramblesMatcherUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText
                primary="Scrambles Matcher"
                secondary="Use it after the competition to attach scrambles to rounds and proceed with results submission."
              />
            </ListItemButton>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Synchronization;
