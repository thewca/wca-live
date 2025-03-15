import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import RecordTag from "../RecordTag/RecordTag";
import { formatAttemptResult } from "../../lib/attempt-result";

function RecordList({ title, records }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <Box
        sx={{
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {records.map((record) => (
          <ListItemButton
            key={record.id}
            component={Link}
            to={`/competitions/${record.result.round.competitionEvent.competition.id}/rounds/${record.result.round.id}`}
          >
            <ListItemIcon>
              <RecordTag recordTag={record.tag} />
            </ListItemIcon>
            <ListItemText
              primary={
                <span>
                  <span>{`${record.result.round.competitionEvent.event.name} ${record.type} of `}</span>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {`${formatAttemptResult(
                      record.attemptResult,
                      record.result.round.competitionEvent.event.id,
                    )}`}
                  </Box>
                </span>
              }
              secondary={`${record.result.person.name} from ${record.result.person.country.name}`}
            />
          </ListItemButton>
        ))}
      </Box>
    </List>
  );
}

export default RecordList;
