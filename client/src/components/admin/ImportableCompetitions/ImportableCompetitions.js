import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';

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
