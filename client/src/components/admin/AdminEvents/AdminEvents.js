import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import EventCard from '../EventCard/EventCard';

const EVENTS_QUERY = gql`
  query Events($id: ID!) {
    competition(id: $id) {
      id
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          number
          name
          open
          finished
        }
      }
    }
  }
`;

function AdminEvents({ match }) {
  const { competitionId } = match.params;
  const { data, loading, error } = useQuery(EVENTS_QUERY, {
    variables: { id: competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const {
    competition: { competitionEvents },
  } = data;

  return (
    <Grid container spacing={2} direction="row">
      {competitionEvents.map((competitionEvent) => (
        <Grid item xs={12} md={4} key={competitionEvent.id}>
          <EventCard
            competitionEvent={competitionEvent}
            competitionId={competitionId}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default AdminEvents;
