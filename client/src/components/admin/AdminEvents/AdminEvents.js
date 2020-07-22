import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import EventCard from '../EventCard/EventCard';

const EVENTS_QUERY = gql`
  query Events($id: ID!) {
    competition(id: $id) {
      id
      events {
        _id
        id
        name
        rounds {
          _id
          id
          name
          open
          finished
          previous {
            _id
            open
            finished
          }
          next {
            _id
            open
            finished
          }
        }
      }
    }
  }
`;

const AdminEvents = ({ match }) => {
  const { competitionId } = match.params;
  const { data, loading, error } = useQuery(EVENTS_QUERY, {
    variables: { id: competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const {
    competition: { events },
  } = data;

  return (
    <Grid container spacing={2} direction="row">
      {events.map((event) => (
        <Grid item xs={12} md={4} key={event.id}>
          <EventCard event={event} competitionId={competitionId} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminEvents;
