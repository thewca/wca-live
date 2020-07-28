import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ImportableCompetitionList from './ImportableCompetitionList';

function ImportableCompetitions() {
  return (
    <Accordion TransitionProps={{ mountOnEnter: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" color="textSecondary">
          Importable competitions
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ImportableCompetitionList />
      </AccordionDetails>
    </Accordion>
  );
}

export default ImportableCompetitions;
