import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Divider, IconButton, Toolbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import CompetitionEventList from './CompetitionEventList';

function CompetitionDrawerContent({ competition }) {
  return (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1,
        }}
      >
        <IconButton
          component={RouterLink}
          to="/"
          aria-label="Homepage"
          size="large"
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          component={RouterLink}
          to={`/competitions/${competition.id}/competitors`}
          aria-label="Competitor"
          size="large"
        >
          <PeopleIcon />
        </IconButton>
        <IconButton
          component={RouterLink}
          to={`/competitions/${competition.id}/podiums`}
          aria-label="Podiums"
          size="large"
        >
          <FormatListNumberedRoundedIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <CompetitionEventList
        competitionEvents={competition.competitionEvents}
        competitionId={competition.id}
      />
    </>
  );
}

export default CompetitionDrawerContent;
