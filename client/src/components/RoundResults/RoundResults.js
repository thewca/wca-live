import React, { useState, useCallback } from 'react';
import { Hidden } from '@material-ui/core';

import RoundResultsTable from './RoundResultsTable';
import RoundResultDialog from './RoundResultDialog';

function RoundResults({ results, format, eventId, competitionId }) {
  const [selectedResult, setSelectedResult] = useState(null);

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  return (
    <>
      <RoundResultsTable
        results={results}
        format={format}
        eventId={eventId}
        competitionId={competitionId}
        onResultClick={handleResultClick}
      />
      <Hidden smUp>
        <RoundResultDialog
          result={selectedResult}
          format={format}
          eventId={eventId}
          competitionId={competitionId}
          onClose={() => setSelectedResult(null)}
        />
      </Hidden>
    </>
  );
}

export default RoundResults;
