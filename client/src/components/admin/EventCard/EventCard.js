import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';

import RoundListItem from './RoundListItem/RoundListItem';
import CubingIcon from '../../CubingIcon/CubingIcon';

const EventCard = ({ competitionEvent, competitionId }) => {
  return (
    <Card style={{ height: '100%' }}>
      <CardHeader
        avatar={<CubingIcon eventId={competitionEvent.event.id} />}
        title={competitionEvent.event.name}
      />
      <CardContent style={{ padding: 0 }}>
        <List dense={true}>
          {competitionEvent.rounds.map((round) => (
            <RoundListItem
              key={round.id}
              round={round}
              competitionEvent={competitionEvent}
              competitionId={competitionId}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default EventCard;
