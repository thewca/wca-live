import React from 'react';
import { withRouter, Link, useHistory } from 'react-router-dom';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AdminCompetitionList from '../AdminCompetitionList/AdminCompetitionList';
import CompetitionList from '../../CompetitionList/CompetitionList';
import ImportableCompetitions from '../ImportableCompetitions/ImportableCompetitions';

const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`;

const useStyles = makeStyles((theme) => ({
  avatar: {
    height: 64,
    width: 64,
  },
  fullWidth: {
    width: '100%',
  },
}));

const AdminDashboard = ({ currentUser }) => {
  const classes = useStyles();
  const apolloClient = useApolloClient();
  const history = useHistory();
  const [signOut, { loading, error }] = useMutation(SIGN_OUT_MUTATION, {
    onCompleted: (data) => {
      apolloClient.clearStore().then(() => history.push('/'));
    },
  });
  const { name, avatar, staffMembers } = currentUser;

  const staffedCompetitions = staffMembers.map(
    (staffMember) => staffMember.competition
  );

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
              <Button variant="outlined" onClick={signOut} disabled={loading}>
                Sign out
              </Button>
              {error && <ErrorSnackbar error={error} />}
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
};

export default AdminDashboard;
