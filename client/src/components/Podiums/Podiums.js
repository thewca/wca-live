import React, { Fragment } from 'react';
import { gql, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import RoundResults from '../RoundResults/RoundResults';
import CubingIcon from '../CubingIcon/CubingIcon';
import { partition } from '../../lib/utils';

const PODIUMS_QUERY = gql`
  query Podiums($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      podiums {
        round {
          id
          finished
          competitionEvent {
            id
            event {
              id
              name
            }
          }
          format {
            numberOfAttempts
            sortBy
          }
        }
        results {
          id
          ranking
          advancing
          attempts {
            result
          }
          best
          average
          person {
            id
            name
            country {
              iso2
              name
            }
          }
          singleRecordTag
          averageRecordTag
        }
      }
    }
  }
`;

function Podiums({ match }) {
  const { data, loading, error } = useQuery(PODIUMS_QUERY, {
    variables: { competitionId: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  const [finishedPodiums, nonfinishedPodiums] = partition(
    competition.podiums,
    (podium) => podium.round.finished
  );

  return (
    <Fragment>
      <Typography variant="h5" gutterBottom>
        Podiums
      </Typography>
      {finishedPodiums.length > 0 ? (
        <Grid container direction="column" spacing={2}>
          {finishedPodiums.map(({ round, results }) => (
            <Grid item key={round.id}>
              <Typography variant="subtitle1">
                {round.competitionEvent.event.name}
              </Typography>
              <RoundResults
                results={results}
                format={round.format}
                eventId={round.competitionEvent.event.id}
                competitionId={competition.id}
              />
            </Grid>
          ))}
          {nonfinishedPodiums.length > 0 && (
            <Grid item>
              <Grid item>
                <Typography>{`Podiums for the following events are yet to be determined:`}</Typography>
              </Grid>
              <Grid container direction="row" spacing={3}>
                {nonfinishedPodiums
                  .map(({ round }) => round.competitionEvent.event)
                  .map((event) => (
                    <Grid item key={event.id}>
                      <Tooltip title={event.name}>
                        <span>
                          <CubingIcon eventId={event.id} />
                        </span>
                      </Tooltip>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography>{`There are no podiums yet!`}</Typography>
      )}
    </Fragment>
  );
}

export default Podiums;
