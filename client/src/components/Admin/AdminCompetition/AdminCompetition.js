import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

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
          <div>
            <div style={{ padding: 24 }}>
              <Typography variant="h5">{competition.name}</Typography>
              Welcome to the competition
            </div>
          </div>
        );
      }}
    </Query>
  )
};

export default AdminCompetition;
