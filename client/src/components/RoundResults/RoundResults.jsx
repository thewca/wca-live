import { useState, useCallback, useMemo } from "react";
import { Button, Grid, useMediaQuery } from "@mui/material";
import RoundResultsTable from "./RoundResultsTable";
import RoundResultDialog from "./RoundResultDialog";
import { resultsForView } from "../../lib/result";

const DEFAULT_VISIBLE_RESULTS = 100;

function RoundResults({
  results,
  format,
  eventId,
  competitionId,
  forecastView,
  advancementCondition,
}) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const [selectedResult, setSelectedResult] = useState(null);
  const [showAll, setShowAll] = useState(
    results.length <= DEFAULT_VISIBLE_RESULTS
  );

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  const viewResults = useMemo(
    () =>
      resultsForView(
        results,
        eventId,
        format,
        forecastView,
        advancementCondition
      ),
    [results, eventId, format, forecastView, advancementCondition]
  );

  const visibleResults = useMemo(() => {
    if (showAll) {
      return viewResults;
    } else {
      return viewResults.slice(0, DEFAULT_VISIBLE_RESULTS);
    }
  }, [viewResults, showAll]);

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
            forecastView={forecastView}
            advancementCondition={advancementCondition}
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
          forecastView={forecastView}
          advancementCondition={advancementCondition}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}

export default RoundResults;
