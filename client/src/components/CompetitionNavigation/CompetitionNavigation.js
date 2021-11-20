import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import CompetitionHome from '../CompetitionHome/CompetitionHome';
import Round from '../Round/Round';
import Competitors from '../Competitors/Competitors';
import Competitor from '../Competitor/Competitor';
import Podiums from '../Podiums/Podiums';
import Error from '../Error/Error';
import CompetitionLayout from './CompetitionLayout';
import Loading from '../Loading/Loading';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      shortName
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          name
          label
          open
        }
      }
      access {
        canScoretake
      }
    }
  }
`;

function CompetitionNavigation() {
  const { competitionId } = useParams();

  const { data, error, loading } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
    // Eventually update rounds data (open, label).
    pollInterval: 60 * 1000,
  });

  if (error) return <Error error={error} />;

  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  const competition = data ? data.competition : null;

  return (
    <CompetitionLayout competition={competition}>
      {loading && <Loading />}
      <Routes>
        <Route path="" element={<CompetitionHome />} />
        <Route path="rounds/:roundId/*" element={<Round />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="competitors/:competitorId" element={<Competitor />} />
        <Route path="podiums" element={<Podiums />} />
        <Route
          path="*"
          element={<Navigate to={`/competitions/${competitionId}`} />}
        />
      </Routes>
    </CompetitionLayout>
  );
}

export default CompetitionNavigation;
