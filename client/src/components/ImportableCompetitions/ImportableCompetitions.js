import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImportableCompetitionList from './ImportableCompetitionList';

function ImportableCompetitions() {
  return (
    <Accordion TransitionProps={{ mountOnEnter: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" color="textSecondary">
          Importable competitions
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <ImportableCompetitionList />
      </AccordionDetails>
    </Accordion>
  );
}

export default ImportableCompetitions;
