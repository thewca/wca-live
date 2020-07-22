import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import CompetitorList from '../CompetitorList/CompetitorList';

const COMPETITORS_QUERY = gql`
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
  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { competitionId: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <CompetitorList
      competitors={competition.competitors}
      competitionId={competition.id}
    />
  );
};

export default Competitors;
