import React from 'react';
import gql from 'graphql-tag';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
import AdminCompetitionList from '../AdminCompetitionList/AdminCompetitionList';
import { COMPETITION_INFO_FRAGMENT } from '../../logic/graphql-fragments';

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

const Admin = () => {
  return (
    <CustomQuery query={ADMIN_QUERY}>
      {({ data, client }) => {
        const { me } = data;
        if (!me) {
          return (
            <Grid
              container
              justify="center"
              alignItems="center"
              style={{ height: '100vh' }}
            >
              <Grid item>
                <Button
                  size="large"
                  variant="outlined"
                  color="primary"
                  href="/oauth/sign-in"
                >
                  Sign in
                </Button>
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
            <div style={{ padding: 24 }}>
              <Grid
                container
                direction="column"
                alignItems="center"
                spacing={3}
              >
                <Grid item>
                  <Avatar
                    src={avatar.thumbUrl}
                    style={{ width: 64, height: 64 }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h5">Hello, {name}!</Typography>
                </Grid>
                <Grid item style={{ width: '100%' }}>
                  <Paper>
                    <AdminCompetitionList
                      manageableCompetitions={manageableCompetitions}
                      importableCompetitions={importableCompetitions}
                      adminQuery={ADMIN_QUERY}
                    />
                  </Paper>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="default"
                    onClick={() => {
                      fetch('/oauth/sign-out', {
                        credentials: 'same-origin',
                      }).then(() => client.resetStore());
                    }}
                  >
                    Sign out
                  </Button>
                </Grid>
              </Grid>
            </div>
          );
        }
      }}
    </CustomQuery>
  );
};

export default Admin;
