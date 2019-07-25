import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import Loading from '../../Loading/Loading';
import AdminEvents from '../AdminEvents/AdminEvents';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      events {
        id
        name
        rounds {
          id
          name
          open
        }
      }
    }
  }
`;

const AdminCompetition = ({ match }) => {
  return (
    <Query query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { competition } = data;
        return (
          <div style={{ padding: 24 }}>
            <Typography variant="h5" gutterBottom>
              {competition.name}
            </Typography>
            <AdminEvents
              events={competition.events}
              competitionId={competition.id}
            />
          </div>
        );
      }}
    </Query>
  );
};

export default AdminCompetition;
