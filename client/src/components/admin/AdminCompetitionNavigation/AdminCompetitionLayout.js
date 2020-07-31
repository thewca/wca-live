import React from 'react';
import { AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import AdminCompetitionToolbar from './AdminCompetitionToolbar';

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

function AdminCompetitionLayout({ competition, children }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="sticky" className={classes.appBar}>
        <AdminCompetitionToolbar competition={competition} />
      </AppBar>
      <div className={classes.content}>{children}</div>
    </>
  );
}

export default AdminCompetitionLayout;
