import React from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import { formatDateRange } from '../../logic/utils';

const CompetitionList = ({ title, competitions }) => {
  return (
    <List>
      <ListSubheader disableSticky>{title}</ListSubheader>
      {competitions.map(competition => (
        <ListItem
          key={competition.id}
          button
          component={Link}
          to={`/competitions/${competition.id}`}
        >
          <ListItemText
            primary={competition.name}
            secondary={formatDateRange(competition.startDate, competition.endDate)}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default CompetitionList;
