import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import FlagIcon from '../FlagIcon/FlagIcon';
import { formatDateRange } from '../../logic/utils';

const CompetitionList = ({ title, competitions }) => {
  return (
    <List dense={true}>
      <ListSubheader disableSticky>{title}</ListSubheader>
      {competitions.map(competition => (
        <ListItem
          key={competition.id}
          button
          component={Link}
          to={`/competitions/${competition.id}`}
        >
          <ListItemIcon>
            {competition.countries.length === 1 ? (
              <FlagIcon
                code={competition.countries[0].iso2.toLowerCase()}
                size="lg"
              />
            ) : (
              <Icon>public</Icon>
            )}
          </ListItemIcon>
          <ListItemText
            primary={competition.name}
            secondary={formatDateRange(
              competition.schedule.startDate,
              competition.schedule.endDate
            )}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default CompetitionList;
