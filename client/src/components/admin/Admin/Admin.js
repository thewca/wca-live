import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, Box, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import CompetitionList from '../../CompetitionList/CompetitionList';
import ImportableCompetitions from '../ImportableCompetitions/ImportableCompetitions';

const ADMIN_QUERY = gql`
  query Admin {
    currentUser {
      id
      name
      avatar {
        thumbUrl
      }
      staffMembers {
        id
        competition {
          id
          name
          startDate
          endDate
          venues {
            id
            country {
              iso2
            }
          }
        }
      }
    }
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

function Admin() {
  const classes = useStyles();

  const { data, loading, error } = useQuery(ADMIN_QUERY);

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { currentUser } = data;

  const { name, avatar, staffMembers } = currentUser;

  const staffedCompetitions = staffMembers.map(
    (staffMember) => staffMember.competition
  );

  return (
    <Box p={3}>
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item>
          <Avatar src={avatar.thumbUrl} alt={name} className={classes.avatar} />
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
      </Grid>
    </Box>
  );
}

export default Admin;
