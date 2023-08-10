import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import AdminCompetitorsTable from "./AdminCompetitorsTable";
import Loading from "../../Loading/Loading";
import Error from "../../Error/Error";

const COMPETITORS_QUERY = gql`
  query Competitors($id: ID!) {
    competition(id: $id) {
      id
      competitors {
        id
        registrantId
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

function AdminCompetitors() {
  const { competitionId } = useParams();
  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;
  const participatedCompetitors = competition.competitors.filter((competitor) =>
    competition.competitionEvents.some((competitionEvent) =>
      competitionEvent.rounds.some((round) =>
        round.results.some(
          (result) =>
            result.person.id === competitor.id && result.attempts.length > 0
        )
      )
    )
  ).length;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Competitors ({participatedCompetitors} /{" "}
        {competition.competitors.length})
      </Typography>
      <AdminCompetitorsTable
        competitors={competition.competitors}
        competitionEvents={competition.competitionEvents}
        competitionId={competition.id}
      />
    </>
  );
}

export default AdminCompetitors;
