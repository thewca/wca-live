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
import TimeAgo from 'react-timeago';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      synchronizedAt
    }
  }
`;

const SYNCHRONIZE_MUTATION = gql`
  mutation Synchronize($competitionId: ID!) {
    synchronize(competitionId: $competitionId) {
      id
      synchronizedAt
    }
  }
`;

const Synchronize = ({ match }) => {
  const { competitionId } = match.params;
  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: competitionId }}>
      {({ data: { competition } }) => (
        <Grid container direction="column" alignItems="center" spacing={1}>
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
            <Typography variant="caption" component="div" align="center">
              Last synchronized{' '}
              <TimeAgo date={new Date(competition.synchronizedAt)} />.
            </Typography>
          </Grid>
          <Grid item style={{ width: '50%' }}>
            <Typography align="justify">
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
              <ListItem
                button
                component="a"
                href={`https://www.worldcubeassociation.org/competitions/${competitionId}/registrations/add`}
                target="_blank"
              >
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
      )}
    </CustomQuery>
  );
};

export default Synchronize;
