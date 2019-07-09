import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import LinearProgress from '@material-ui/core/LinearProgress';

const COMPETITION_QUERY = gql`
  query CompetitionQuery($id: ID!) {
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
        if (loading) return <LinearProgress />;
        const { competition } = data;
        return (
          <div style={{ padding: 24 }}>
            {competition.name}
          </div>
        );
      }}
    </Query>
  )
};

export default AdminCompetition;
