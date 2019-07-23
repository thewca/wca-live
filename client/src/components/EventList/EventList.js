import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import CubingIcon from '../CubingIcon/CubingIcon';

const EventList = ({ events, competitionId }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <List dense={true}>
      {events.map(event => (
        <Fragment key={event.id}>
          <ListItem
            button
            onClick={() =>
              setSelectedEvent(selectedEvent === event.id ? null : event.id)
            }
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
