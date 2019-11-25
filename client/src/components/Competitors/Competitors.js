import React from 'react';
import gql from 'graphql-tag';

import CustomQuery from '../CustomQuery/CustomQuery';
import CompetitorList from '../CompetitorList/CompetitorList';

const COMPETITION_QUERY = gql`
  query Competition($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      competitors {
        _id
        id
        name
        country {
          iso2
        }
      }
    }
  }
`;

const Competitors = ({ match }) => {
  const { competitionId } = match.params;

  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ competitionId }}>
      {({ data: { competition } }) => (
        <CompetitorList
          competitors={competition.competitors}
          competitionId={competitionId}
        />
      )}
    </CustomQuery>
  );
};

export default Competitors;
