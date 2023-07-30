import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Box, Tab, Tabs } from '@mui/material';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import AdminAccess from '../AdminAccess/AdminAccess';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      staffMembers {
        id
        user {
          id
          name
        }
        roles
      }
    }
  }
`;

function AdminSettings() {
  const { competitionId } = useParams();
  const [tabValue, setTabValue] = useState('access');

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  return (
    <>
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        value={tabValue}
        onChange={(event, value) => setTabValue(value)}
      >
        <Tab label="Access" value="access" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 'access' && <AdminAccess competition={competition} />}
      </Box>
    </>
  );
}

export default AdminSettings;
