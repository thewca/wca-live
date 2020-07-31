import React, { useState } from 'react';
import { Hidden, Grid, Typography } from '@material-ui/core';
import CompetitorResultsTable from './CompetitorResultsTable';
import CompetitorResultDialog from './CompetitorResultDialog';
import { groupBy, orderBy } from '../../lib/utils';

function CompetitorResults({ results, competitionId }) {
  const [selectedResult, setSelectedResult] = useState(null);

  const nonemptyResults = results.filter(
    (result) => result.attempts.length > 0
  );
  const resultsByEventName = groupBy(
    orderBy(nonemptyResults, [
      (result) => result.round.competitionEvent.event.rank,
      (result) => result.round.number,
    ]),
    (result) => result.round.competitionEvent.event.name
  );

  return (
    <>
      <Grid container direction="column" spacing={2}>
        {Object.entries(resultsByEventName).map(([eventName, results]) => (
          <Grid item key={eventName}>
            <Typography variant="subtitle1" gutterBottom>
              {eventName}
            </Typography>
            <CompetitorResultsTable
              results={results}
              competitionId={competitionId}
              onResultClick={(result) => setSelectedResult(result)}
            />
          </Grid>
        ))}
      </Grid>
      <Hidden smUp>
        <CompetitorResultDialog
          result={selectedResult}
          competitionId={competitionId}
          onClose={() => setSelectedResult(null)}
        />
      </Hidden>
    </>
  );
}

export default CompetitorResults;
