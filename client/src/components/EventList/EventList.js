import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import scrollIntoView from 'scroll-into-view-if-needed';

import CubingIcon from '../CubingIcon/CubingIcon';

const useStyles = makeStyles(theme => ({
  labelChip: {
    borderRadius: 6,
    fontSize: '0.8em',
    fontWeight: 500,
  },
}));

const EventList = ({ events, competitionId }) => {
  const classes = useStyles();
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <List dense={true}>
      {events.map(event => (
        <Fragment key={event.id}>
          <ListItem
            button
            onClick={e => {
              setSelectedEvent(selectedEvent === event.id ? null : event.id);
              e.stopPropagation();
            }}
            disabled={event.rounds.every(round => !round.open)}
          >
            <ListItemIcon>
              <CubingIcon eventId={event.id} />
            </ListItemIcon>
            <ListItemText primary={event.name} />
          </ListItem>
          <Collapse
            in={selectedEvent === event.id}
            timeout="auto"
            unmountOnExit
            onEntered={element => {
              scrollIntoView(element, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
                block: 'end',
              });
            }}
          >
            <List dense={true}>
              {event.rounds.map(round => (
                <ListItem
                  key={round.id}
                  button
                  component={Link}
                  to={`/competitions/${competitionId}/rounds/${round.id}`}
                  disabled={!round.open}
                >
                  <ListItemText primary={round.name} />
                  {round.label && (
                    <Chip
                      label={round.label}
                      size="small"
                      className={classes.labelChip}
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
};

export default EventList;
