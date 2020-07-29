import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CompetitionList from '../../CompetitionList/CompetitionList';
import ImportableCompetitions from '../ImportableCompetitions/ImportableCompetitions';
import { clearToken } from '../../../lib/auth';

const useStyles = makeStyles((theme) => ({
  avatar: {
    height: 64,
    width: 64,
  },
  fullWidth: {
    width: '100%',
  },
}));

function AdminDashboard({ currentUser }) {
  const classes = useStyles();
  const apolloClient = useApolloClient();
  const history = useHistory();

  const { name, avatar, staffMembers } = currentUser;

  const staffedCompetitions = staffMembers.map(
    (staffMember) => staffMember.competition
  );

  function handleSignOut() {
    clearToken();
    apolloClient.clearStore().then(() => {
      history.push('/');
    });
  }

  return (
    <Box p={3}>
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item>
          <Avatar src={avatar.thumbUrl} className={classes.avatar} />
        </Grid>
        <Grid item>
          <Typography variant="h5">Hello, {name}!</Typography>
        </Grid>
        <Grid item className={classes.fullWidth}>
          <Paper>
            <CompetitionList
              title="Staffed competitions"
              competitions={staffedCompetitions}
              pathPrefix="/admin"
            />
          </Paper>
        </Grid>
        <Grid item className={classes.fullWidth}>
          <ImportableCompetitions />
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="outlined" onClick={handleSignOut}>
                Sign out
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/"
              >
                Home
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;
