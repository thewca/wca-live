import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Grid, Typography, Tooltip } from "@mui/material";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import RoundResults from "../RoundResults/RoundResults";
import CubingIcon from "../CubingIcon/CubingIcon";
import { partition } from "../../lib/utils";

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
            id
            numberOfAttempts
            sortBy
          }
        }
        results {
          id
          ranking
          advancing
          advancingQuestionable
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

function Podiums() {
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(PODIUMS_QUERY, {
    variables: { competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  const [finishedPodiums, nonfinishedPodiums] = partition(
    competition.podiums,
    (podium) => podium.round.finished,
  );

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Podiums
      </Typography>
      {finishedPodiums.length > 0 ? (
        <Grid container direction="column" spacing={2}>
          {finishedPodiums.map(({ round, results }) => (
            <Grid item key={round.id}>
              <Typography variant="subtitle1" gutterBottom>
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
              <Typography gutterBottom>
                {`Podiums for the following events are yet to be determined:`}
              </Typography>
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
    </>
  );
}

export default Podiums;
