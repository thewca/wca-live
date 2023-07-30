import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import AdminCompetitionEvents from "../AdminCompetitionEvents/AdminCompetitionEvents";
import Synchronization from "../Synchronization/Synchronization";
import AdminSettings from "../AdminSettings/AdminSettings";
import RoundDoubleCheck from "../RoundDoubleCheck/RoundDoubleCheck";
import AdminRound from "../AdminRound/AdminRound";
import AdminCompetitors from "../AdminCompetitors/AdminCompetitors";
import Loading from "../../Loading/Loading";
import Error from "../../Error/Error";
import AdminCompetitionLayout from "./AdminCompetitionLayout";

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      shortName
      access {
        canManage
        canScoretake
      }
    }
  }
`;

function AdminCompetitionNavigation() {
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  if (!competition.access.canScoretake) return <Navigate to="/sign-in" />;

  return (
    <AdminCompetitionLayout competition={competition}>
      <Routes>
        <Route path="" element={<AdminCompetitionEvents />} />
        {competition.access.canManage && (
          <Route path="sync" element={<Synchronization />} />
        )}
        {competition.access.canManage && (
          <Route path="settings" element={<AdminSettings />} />
        )}
        <Route
          path="rounds/:roundId/double-check"
          element={<RoundDoubleCheck />}
        />
        <Route path="rounds/:roundId" element={<AdminRound />} />
        <Route path="competitors" element={<AdminCompetitors />} />
        <Route
          path="*"
          element={<Navigate to={`/admin/competitions/${competition.id}`} />}
        />
      </Routes>
    </AdminCompetitionLayout>
  );
}

export default AdminCompetitionNavigation;
