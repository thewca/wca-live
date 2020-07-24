import React, { Fragment } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import CompetitorsTable from '../CompetitorsTable/CompetitorsTable';
import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';

const COMPETITORS_QUERY = gql`
  query Competitors($id: ID!) {
    competition(id: $id) {
      id
      competitors {
        id
        name
        wcaId
        country {
          iso2
          name
        }
      }
      competitionEvents {
        id
        event {
          id
        }
        rounds {
          id
          results {
            id
            person {
              id
            }
            attempts {
              result
            }
          }
        }
      }
    }
  }
`;

const AdminCompetitors = () => {
  const { competitionId } = useParams();
  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { id: competitionId },
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
        competitionEvents={competition.competitionEvents}
      />
    </Fragment>
  );
};

export default AdminCompetitors;
