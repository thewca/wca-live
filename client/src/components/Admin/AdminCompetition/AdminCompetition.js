import React from 'react';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../../CustomQuery/CustomQuery';
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
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: match.params.id }}>
      {({ data: { competition } }) => (
        <div style={{ padding: 24 }}>
          <Typography variant="h5" gutterBottom>
            {competition.name}
          </Typography>
          <AdminEvents
            events={competition.events}
            competitionId={competition.id}
          />
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminCompetition;
