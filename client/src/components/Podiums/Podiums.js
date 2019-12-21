import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import RoundResults from '../RoundResults/RoundResults';

const PODIUMS_QUERY = gql`
  query Podiums($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      podiums {
        _id
        id
        event {
          _id
          id
          name
        }
        format {
          solveCount
          sortBy
        }
        results {
          _id
          ranking
          advancable
          attempts
          best
          average
          person {
            _id
            id
            name
            country {
              name
            }
          }
          recordTags {
            single
            average
          }
        }
      }
    }
  }
`;

const Podiums = ({ match }) => {
  const { data, loading, error } = useQuery(PODIUMS_QUERY, {
    variables: { competitionId: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <Fragment>
      <Typography variant="h5" gutterBottom>
        Podiums
      </Typography>
      {competition.podiums.length > 0 ? (
        <Grid container direction="column" spacing={2}>
          {competition.podiums.map(round => (
            <Grid item key={round.id}>
              <Typography variant="subtitle1">{round.event.name}</Typography>
              <RoundResults
                results={round.results}
                format={round.format}
                eventId={round.event.id}
                competitionId={competition.id}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>{`There are no podiums yet!`}</Typography>
      )}
    </Fragment>
  );
};

export default Podiums;
