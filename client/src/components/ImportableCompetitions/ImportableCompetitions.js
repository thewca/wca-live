import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ImportableCompetitionList from './ImportableCompetitionList';

const useStyles = makeStyles((theme) => ({
  accordionDetailsRoot: {
    padding: 0,
  },
}));

function ImportableCompetitions() {
  const classes = useStyles();

  return (
    <Accordion TransitionProps={{ mountOnEnter: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" color="textSecondary">
          Importable competitions
        </Typography>
      </AccordionSummary>
      <AccordionDetails classes={{ root: classes.accordionDetailsRoot }}>
        <ImportableCompetitionList />
      </AccordionDetails>
    </Accordion>
  );
}

export default ImportableCompetitions;
