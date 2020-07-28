import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Redirect, useParams } from 'react-router-dom';
import { AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import AdminCompetitionNavigation from './AdminCompetitionNavigation';
import AdminCompetitionToolbar from './AdminCompetitionToolbar';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      access {
        canManage
        canScoretake
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  content: {
    position: 'relative', // For LinearProgress
    padding: theme.spacing(3),
  },
}));

function AdminCompetition() {
  const classes = useStyles();
  const { id } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  if (!competition.access.canScoretake) {
    return <Redirect to={`/competitions/${competition.id}`} />;
  }

  return (
    <>
      <AppBar position="sticky" className={classes.appBar}>
        <AdminCompetitionToolbar competition={competition} />
      </AppBar>
      <div className={classes.content}>
        <AdminCompetitionNavigation competition={competition} />
      </div>
    </>
  );
}

export default AdminCompetition;
