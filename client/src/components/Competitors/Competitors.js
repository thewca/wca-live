import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import Loading from '../Loading/Loading';
import Error from '../Error/Error';
import CompetitorList from './CompetitorList';

const COMPETITORS_QUERY = gql`
  query Competition($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      competitors {
        id
        name
        country {
          iso2
        }
      }
    }
  }
`;

function Competitors() {
  const { competitionId } = useParams();
  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { competitionId: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  return (
    <CompetitorList
      competitors={competition.competitors}
      competitionId={competition.id}
    />
  );
}

export default Competitors;
