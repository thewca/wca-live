import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles((theme) => ({
  tabContent: {
    marginTop: theme.spacing(2),
  },
}));

function AdminSettings() {
  const classes = useStyles();
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
      <Tabs value={tabValue} onChange={(event, value) => setTabValue(value)}>
        <Tab label="Access" value="access" />
      </Tabs>
      <div className={classes.tabContent}>
        {tabValue === 'access' && <AdminAccess competition={competition} />}
      </div>
    </>
  );
}

export default AdminSettings;
