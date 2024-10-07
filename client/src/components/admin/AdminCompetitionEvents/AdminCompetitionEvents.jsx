import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Grid } from "@mui/material";
import Loading from "../../Loading/Loading";
import Error from "../../Error/Error";
import AdminCompetitionEventCard from "./AdminCompetitionEventCard";

const COMPETITION_EVENTS_QUERY = gql`
  query CompetitionEvents($id: ID!) {
    competition(id: $id) {
      id
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          number
          name
          open
          finished
          enteredResults
          totalResults
        }
      }
    }
  }
`;

function AdminCompetitionEvents() {
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_EVENTS_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const {
    competition: { competitionEvents },
  } = data;

  return (
    <Grid container spacing={2} direction="row">
      {competitionEvents.map((competitionEvent) => (
        <Grid item xs={12} md={4} key={competitionEvent.id}>
          <AdminCompetitionEventCard
            competitionEvent={competitionEvent}
            competitionId={competitionId}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default AdminCompetitionEvents;
