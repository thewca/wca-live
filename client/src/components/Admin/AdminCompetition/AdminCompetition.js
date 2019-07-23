import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Typography from '@material-ui/core/Typography';

import Loading from '../../Loading/Loading';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
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
            <Typography variant="h5">{competition.name}</Typography>
          </div>
        );
      }}
    </Query>
  );
};

export default AdminCompetition;
