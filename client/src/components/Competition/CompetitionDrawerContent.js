import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Divider, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import FormatListNumberedRoundedIcon from '@material-ui/icons/FormatListNumberedRounded';
import CompetitionEventList from './CompetitionEventList';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
}));

function CompetitionDrawerContent({ competition }) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.toolbar}>
        <IconButton component={RouterLink} to="/" aria-label="Home page">
          <HomeIcon />
        </IconButton>
        <IconButton
          component={RouterLink}
          to={`/competitions/${competition.id}/competitors`}
          aria-label="Competitor"
        >
          <PeopleIcon />
        </IconButton>
        <IconButton
          component={RouterLink}
          to={`/competitions/${competition.id}/podiums`}
          aria-label="Podiums"
        >
          <FormatListNumberedRoundedIcon />
        </IconButton>
      </div>
      <Divider />
      <CompetitionEventList
        competitionEvents={competition.competitionEvents}
        competitionId={competition.id}
      />
    </>
  );
}

export default CompetitionDrawerContent;
