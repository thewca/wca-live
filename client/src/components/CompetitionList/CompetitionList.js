import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import PublicIcon from '@material-ui/icons/Public';
import FlagIcon from '../FlagIcon/FlagIcon';
import VirtualList from '../VirtualList/VirtualList';
import { formatDateRange } from '../../lib/date';
import { competitionCountries } from '../../lib/competitions';

function CompetitionList({ title, competitions, pathPrefix = '' }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <VirtualList
        maxHeight={300}
        itemHeigh={60}
        items={competitions}
        renderItem={(competition, { style }) => {
          const countries = competitionCountries(competition);

          return (
            <ListItem
              key={competition.id}
              style={style}
              button
              component={Link}
              to={`${pathPrefix}/competitions/${competition.id}`}
            >
              <ListItemIcon>
                {countries.length === 1 ? (
                  <FlagIcon code={countries[0].iso2.toLowerCase()} size="lg" />
                ) : (
                  <PublicIcon />
                )}
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
