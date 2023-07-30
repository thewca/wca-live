import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import VirtualList from '../VirtualList/VirtualList';
import CompetitionFlagIcon from '../CompetitionFlagIcon/CompetitionFlagIcon';
import { formatDateRange } from '../../lib/date';

function CompetitionList({ title, competitions }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <VirtualList
        maxHeight={300}
        itemHeight={60}
        items={competitions}
        renderItem={(competition, { style }) => {
          return (
            <ListItem
              key={competition.id}
              style={style}
              button
              component={Link}
              to={`/competitions/${competition.id}`}
            >
              <ListItemIcon>
                <ListItemIcon>
                  <CompetitionFlagIcon competition={competition} />
                </ListItemIcon>
              </ListItemIcon>
              <ListItemText
                primary={competition.name}
                secondary={formatDateRange(
                  competition.startDate,
                  competition.endDate
                )}
              />
            </ListItem>
          );
        }}
      />
    </List>
  );
}

export default CompetitionList;
