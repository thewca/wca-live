import React from 'react';
import { Card, CardContent, CardHeader, List } from '@mui/material';
import AdminRoundListItem from './AdminRoundListItem';
import CubingIcon from '../../CubingIcon/CubingIcon';

function AdminCompetitionEventCard({ competitionEvent, competitionId }) {
  return (
    <Card style={{ height: '100%' }}>
      <CardHeader
        avatar={<CubingIcon eventId={competitionEvent.event.id} />}
        title={competitionEvent.event.name}
      />
      <CardContent style={{ padding: 0 }}>
        <List dense={true}>
          {competitionEvent.rounds.map((round) => (
            <AdminRoundListItem
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
}

export default AdminCompetitionEventCard;
