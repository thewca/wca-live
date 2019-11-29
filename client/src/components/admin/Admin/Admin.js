import React from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';
import CompetitionSignInForm from '../../CompetitionSignInForm/CompetitionSignInForm';
import AdminCompetitionList from '../AdminCompetitionList/AdminCompetitionList';
import { COMPETITION_INFO_FRAGMENT } from '../../../logic/graphql-fragments';
import { signInUrl } from '../../../logic/auth';

const ADMIN_QUERY = gql`
  query Competitions {
    me {
      id
      name
      avatar {
        thumbUrl
      }
      manageableCompetitions {
        ...competitionInfo
      }
      importableCompetitions {
        ...competitionInfo
      }
    }
  }
  ${COMPETITION_INFO_FRAGMENT}
`;

const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`;

const useStyles = makeStyles(theme => ({
  screenHeight: {
    height: '100vh',
  },
  center: {
    textAlign: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  avatar: {
    height: 64,
    width: 64,
  },
  fullWidth: {
    width: '100%',
  },
}));

const Admin = ({ history }) => {
  const classes = useStyles();
  return (
    <CustomQuery query={ADMIN_QUERY}>
      {({ data, client }) => {
        const { me } = data;
        if (!me) {
          return (
            <Grid
              container
              alignItems="center"
              className={classes.screenHeight}
            >
              <Grid item xs={12} md className={classes.center}>
                <Typography variant="h5" className={classes.title}>
                  Use your WCA account
                </Typography>
                <Button
                  size="large"
                  variant="outlined"
                  color="primary"
                  href={signInUrl}
                >
                  Sign in
                </Button>
              </Grid>
              <Hidden smDown>
                <Divider orientation="vertical" />
              </Hidden>
              <Grid item xs={12} md className={classes.center}>
                <Typography variant="h5" className={classes.title}>
                  Use competition dedicated password
                </Typography>
                <CompetitionSignInForm />
              </Grid>
            </Grid>
          );
        } else {
          const {
            name,
            avatar,
            manageableCompetitions,
            importableCompetitions,
          } = me;
          return (
            <Box p={3}>
              <Grid
                container
                direction="column"
                alignItems="center"
                spacing={3}
              >
                <Grid item>
                  <Avatar src={avatar.thumbUrl} className={classes.avatar} />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Hello, {name}!</Typography>
                </Grid>
                <Grid item className={classes.fullWidth}>
                  <Paper>
                    <AdminCompetitionList
                      manageableCompetitions={manageableCompetitions}
                      importableCompetitions={importableCompetitions}
                      adminQuery={ADMIN_QUERY}
                    />
                  </Paper>
                </Grid>
                <Grid item>
                  <Grid container spacing={2}>
                    <Grid item>
                      <CustomMutation
                        mutation={SIGN_OUT_MUTATION}
                        onCompleted={data => {
                          client.clearStore().then(() => history.push('/'));
                        }}
                      >
                        {(signOut, { loading }) => (
                          <Button
                            variant="outlined"
                            onClick={signOut}
                            disabled={loading}
                          >
                            Sign out
                          </Button>
                        )}
                      </CustomMutation>
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
      }}
    </CustomQuery>
  );
};

export default Admin;
