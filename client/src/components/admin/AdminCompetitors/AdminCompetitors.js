import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import Typography from '@material-ui/core/Typography';

import CompetitorsTable from '../CompetitorsTable/CompetitorsTable';
import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';

const COMPETITORS_QUERY = gql`
  query Competitors($id: ID!) {
    competition(id: $id) {
      id
      competitors {
        _id
        id
        name
        wcaId
        country {
          name
        }
      }
      events {
        _id
        id
        rounds {
          _id
          results {
            person {
              _id
              id
            }
            attempts
          }
        }
      }
    }
  }
`;

const AdminCompetitors = ({ match }) => {
  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { id: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <Fragment>
      <Typography variant="h5" gutterBottom>
        Competitors
      </Typography>
      <CompetitorsTable
        competitors={competition.competitors}
        events={competition.events}
      />
    </Fragment>
  );
};

export default AdminCompetitors;
