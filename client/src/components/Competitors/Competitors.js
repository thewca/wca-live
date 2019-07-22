import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Loading from '../Loading/Loading';
import CompetitorList from '../CompetitorList/CompetitorList';

const COMPETITION_QUERY = gql`
  query Competition($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      competitors {
        id
        name
      }
    }
  }
`;

const Competitors = ({ match }) => {
  const { competitionId } = match.params;

  return (
    <Query query={COMPETITION_QUERY} variables={{ competitionId }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { competition } = data;

        return (
          <CompetitorList
            competitors={competition.competitors}
            competitionId={competitionId}
          />
        );
      }}
    </Query>
  )
};

export default Competitors;
