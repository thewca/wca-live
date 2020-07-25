import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AccessSettings from '../AccessSettings/AccessSettings';

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
  root: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: 'calc(100vh - 64px)',
    width: '100%',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    minWidth: 250,
  },
  tabContent: {
    flexGrow: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
  },
}));

const AdminSettings = ({ match }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState('access');

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: match.params.competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        value={tabValue}
        onChange={(event, value) => setTabValue(value)}
        className={classes.tabs}
      >
        <Tab label="Access" value="access" />
      </Tabs>
      <div className={classes.tabContent}>
        {tabValue === 'access' && <AccessSettings competition={competition} />}
      </div>
    </div>
  );
};

export default AdminSettings;
