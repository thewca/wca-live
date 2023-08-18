import { useState, useCallback, useMemo } from "react";
import { Button, Grid, useMediaQuery } from "@mui/material";
import RoundResultsTable from "./RoundResultsTable";
import RoundResultDialog from "./RoundResultDialog";

const DEFAULT_VISIBLE_RESULTS = 100;

function RoundResults({
  results,
  format,
  eventId,
  competitionId,
  roundFormat,
}) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);
  const [showAll, setShowAll] = useState(
    results.length <= DEFAULT_VISIBLE_RESULTS
  );

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  const visibleResults = useMemo(() => {
    if (showAll) {
      return results;
    } else {
      return results.slice(0, DEFAULT_VISIBLE_RESULTS);
    }
  }, [results, showAll]);

  return (
    <>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item style={{ width: "100%" }}>
          <RoundResultsTable
            results={visibleResults}
            format={format}
            eventId={eventId}
            competitionId={competitionId}
            onResultClick={handleResultClick}
            roundFormat={roundFormat}
          />
        </Grid>
        {!showAll && (
          <Grid item>
            <Button
              variant="contained"
              disableElevation
              size="small"
              onClick={() => setShowAll(true)}
            >
              {results.length - DEFAULT_VISIBLE_RESULTS} more
            </Button>
          </Grid>
        )}
      </Grid>
      {!smScreen && (
        <RoundResultDialog
          result={selectedResult}
          format={format}
          eventId={eventId}
          competitionId={competitionId}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}

export default RoundResults;
