import React, { Fragment, useState, useCallback } from 'react';
import Hidden from '@material-ui/core/Hidden';

import RoundResultsTable from '../RoundResultsTable/RoundResultsTable';
import RoundResultDialog from '../RoundResultDialog/RoundResultDialog';

function RoundResults({ results, format, eventId, competitionId }) {
  const [selectedResult, setSelectedResult] = useState(null);

  const handleResultClick = useCallback((result, event) => {
    setSelectedResult(result);
  }, []);

  return (
    <Fragment>
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
    </Fragment>
  );
}

export default RoundResults;
