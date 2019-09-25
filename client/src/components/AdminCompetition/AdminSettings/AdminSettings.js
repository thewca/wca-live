import React, { useState } from 'react';
import gql from 'graphql-tag';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';

import CustomQuery from '../../CustomQuery/CustomQuery';
import AccessSettings from '../AccessSettings/AccessSettings';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      competitors {
        id
        name
        avatar {
          thumbUrl
        }
      }
      scoretakers {
        id
      }
      passwordAuthEnabled
    }
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    height: 'calc(100vh - 64px)',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    minWidth: 250,
  },
  tabContent: {
    padding: theme.spacing(2),
    overflowY: 'auto',
  },
}));

const AdminSettings = ({ match }) => {
  const classes = useStyles();
  const { competitionId } = match.params;
  const [tabValue, setTabValue] = useState('access');

  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: competitionId }}>
      {({ data: { competition } }) => (
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
            {tabValue === 'access' && (
              <AccessSettings competition={competition} />
            )}
          </div>
        </div>
      )}
    </CustomQuery>
  );
};

export default AdminSettings;
