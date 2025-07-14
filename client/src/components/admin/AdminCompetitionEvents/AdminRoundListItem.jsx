import { Link as RouterLink } from "react-router-dom";
import {
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import OpenRoundButton from "./OpenRoundButton";
import ClearRoundButton from "./ClearRoundButton";

function roundOpenable(round, competitionEvent) {
  const previous = competitionEvent.rounds.find(
    (other) => other.number === round.number - 1,
  );
  return !round.open && (!previous || previous.open);
}

function roundClearable(round, competitionEvent) {
  const next = competitionEvent.rounds.find(
    (other) => other.number === round.number + 1,
  );
  return round.open && (!next || !next.open);
}

function AdminRoundListItem({ round, competitionEvent, competitionId }) {
  return (
    <ListItem
      key={round.id}
      secondaryAction={
        <ListItemSecondaryAction>
          {roundOpenable(round, competitionEvent) && (
            <OpenRoundButton
              round={round}
              competitionEvent={competitionEvent}
            />
          )}
          {roundClearable(round, competitionEvent) && (
            <ClearRoundButton
              round={round}
              competitionEvent={competitionEvent}
            />
          )}
        </ListItemSecondaryAction>
      }
      disablePadding
    >
      <ListItemButton
        component={RouterLink}
        to={`/admin/competitions/${competitionId}/rounds/${round.id}`}
        disabled={!round.open}
      >
        <ListItemText
          primary={
            <>
              {round.name}
              {round.numResults > 0 && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "text.secondary", display: "inline" }}
                >
                  {" "}
                  ({round.numEnteredResults} of {round.numResults} entered)
                </Typography>
              )}
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

export default AdminRoundListItem;
