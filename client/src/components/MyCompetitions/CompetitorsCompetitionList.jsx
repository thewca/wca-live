import { Link } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import VirtualList from "../VirtualList/VirtualList";
import CompetitionFlagIcon from "../CompetitionFlagIcon/CompetitionFlagIcon";
import { formatDateRange } from "../../lib/date";

function CompetitorsCompetitionList({ title, competitors }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <VirtualList
        maxHeight={300}
        itemHeight={60}
        items={competitors}
        renderItem={(person, { style }) => {
          const competition = person.competition;

          return (
            <ListItemButton
              key={competition.id}
              style={style}
              component={Link}
              to={`/competitions/${competition.id}/competitors/${person.id}`}
            >
              <ListItemIcon>
                <CompetitionFlagIcon competition={competition} />
              </ListItemIcon>
              <ListItemText
                primary={competition.name}
                secondary={formatDateRange(
                  competition.startDate,
                  competition.endDate
                )}
              />
            </ListItemButton>
          );
        }}
      />
    </List>
  );
}

export default CompetitorsCompetitionList;
