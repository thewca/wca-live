import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import AdminRoundContent from './AdminRoundContent';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';

const ROUND_QUERY = gql`
  query Round($id: ID!) {
    round(id: $id) {
      id
      name
      number
      competitionEvent {
        id
        event {
          id
          name
        }
        rounds {
          id
          number
          open
        }
      }
      format {
        id
        numberOfAttempts
        sortBy
      }
      timeLimit {
        centiseconds
        cumulativeRoundWcifIds
      }
      cutoff {
        numberOfAttempts
        attemptResult
      }
      results {
        id
        ...adminRoundResult
      }
    }
    officialWorldRecords {
      event {
        id
      }
      type
      attemptResult
    }
  }
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

function AdminRound() {
  const { competitionId, roundId } = useParams();

  const { data, loading, error } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { round, officialWorldRecords } = data;

  return (
    <AdminRoundContent
      round={round}
      competitionId={competitionId}
      officialWorldRecords={officialWorldRecords}
    />
  );
}

export default AdminRound;
