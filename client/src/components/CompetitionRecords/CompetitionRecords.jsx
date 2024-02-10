import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import RecordList from "../RecordList/RecordList";

const RECORDS_QUERY = gql`
  query CompetitionRecords($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      competitionRecords {
        id
        tag
        type
        attemptResult
        result {
          id
          person {
            id
            name
            country {
              iso2
              name
            }
          }
          round {
            id
            competitionEvent {
              id
              event {
                id
                name
              }
              competition {
                id
              }
            }
          }
        }
      }
    }
  }
`;

function CompetitionRecords() {
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(RECORDS_QUERY, {
    variables: { competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competitionRecords } = data.competition;

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom>
        Records broken at this competition
      </Typography>
      {competitionRecords.length > 0 ? (
        <RecordList records={competitionRecords} />
      ) : (
        <Typography variant="body1" component="p">
          No records broken at this competition.
        </Typography>
      )}
    </>
  );
}

export default CompetitionRecords;
