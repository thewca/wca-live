import React from 'react';
import gql from 'graphql-tag';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import CustomMutation from '../../CustomMutation/CustomMutation';

const SYNCHRONIZE_MUTATION = gql`
  mutation Synchronize($competitionId: ID!) {
    synchronize(competitionId: $competitionId) {
      id
    }
  }
`;

const Synchronize = ({ match }) => {
  const { competitionId } = match.params;
  return (
    <div style={{ padding: 24 }}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <CustomMutation
            mutation={SYNCHRONIZE_MUTATION}
            variables={{ competitionId }}
          >
            {(synchronize, { loading }) => (
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={synchronize}
                disabled={loading}
              >
                Synchronize
              </Button>
            )}
          </CustomMutation>
        </Grid>
        <Grid item style={{ width: '50%' }}>
          <Typography>
            {`
              We use competition information from the WCA website.
              If you want to add competitors or change round information,
              you need to make those changes on the WCA website,
              and then click the "Synchronize" button above.
            `}
          </Typography>
        </Grid>
        <Grid item style={{ width: '50%' }}>
          <List>
            <ListItem button>
              <ListItemIcon>
                <Icon>person_add</Icon>
              </ListItemIcon>
              <ListItemText>Add competitor</ListItemText>
            </ListItem>
            <ListItem
              button
              component="a"
              href={`https://www.worldcubeassociation.org/competitions/${competitionId}/events/edit`}
              target="_blank"
            >
              <ListItemIcon>
                <Icon>edit</Icon>
              </ListItemIcon>
              <ListItemText>Change round data</ListItemText>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

export default Synchronize;
