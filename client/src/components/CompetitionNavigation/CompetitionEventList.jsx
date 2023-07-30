import { Fragment, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import scrollIntoView from "scroll-into-view-if-needed";

import CubingIcon from "../CubingIcon/CubingIcon";

function CompetitionEventList({ competitionEvents, competitionId }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleCompetitionEventClick(event, competitionEvent) {
    setSelectedId(
      selectedId === competitionEvent.id ? null : competitionEvent.id
    );
    // Prevent swipeable drawer from closing when event gets selected.
    event.stopPropagation();
  }

  return (
    <List dense={true}>
      {competitionEvents.map((competitionEvent) => (
        <Fragment key={competitionEvent.id}>
          <ListItem
            button
            onClick={(event) =>
              handleCompetitionEventClick(event, competitionEvent)
            }
            disabled={!competitionEvent.rounds.some((round) => round.open)}
          >
            <ListItemIcon>
              <CubingIcon eventId={competitionEvent.event.id} />
            </ListItemIcon>
            <ListItemText primary={competitionEvent.event.name} />
          </ListItem>
          <Collapse
            in={selectedId === competitionEvent.id}
            timeout="auto"
            unmountOnExit
            onEntered={(element) => {
              scrollIntoView(element, {
                behavior: "smooth",
                scrollMode: "if-needed",
                block: "end",
              });
            }}
          >
            <List dense={true}>
              {competitionEvent.rounds.map((round) => (
                <ListItem
                  key={round.id}
                  button
                  component={RouterLink}
                  to={`/competitions/${competitionId}/rounds/${round.id}`}
                  disabled={!round.open}
                >
                  <ListItemText primary={round.name} />
                  {round.label && (
                    <Chip
                      label={round.label}
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        fontSize: "0.7em",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Fragment>
      ))}
    </List>
  );
}

export default CompetitionEventList;
