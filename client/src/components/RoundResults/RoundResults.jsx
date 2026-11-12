import { useState, useCallback, useMemo } from "react";
import { Button, Grid, useMediaQuery } from "@mui/material";
import RoundResultsTable from "./RoundResultsTable";
import RoundResultDialog from "./RoundResultDialog";
import { resultsForView, sortResultsByColumn } from "../../lib/result";

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
  const [sortConfig, setSortConfig] = useState(null);
  const [showAll, setShowAll] = useState(
    results.length <= DEFAULT_VISIBLE_RESULTS,
  );

  const handleResultClick = useCallback((result) => {
    setSelectedResult(result);
  }, []);

  const handleSortChange = useCallback((newConfig) => {
    setSortConfig((prev) => {
      if (!newConfig) return null;
      if (
        prev &&
        prev.type === newConfig.type &&
        prev.index === newConfig.index &&
        prev.field === newConfig.field
      ) {
        if (prev.direction === "asc") {
          return { ...newConfig, direction: "desc" };
        } else {
          return null;
        }
      }
      return { ...newConfig, direction: "asc" };
    });
  }, []);

  const viewResults = useMemo(
    () =>
      resultsForView(
        results,
        eventId,
        format,
        forecastView,
        advancementCondition,
      ),
    [results, eventId, format, forecastView, advancementCondition],
  );

  const sortedResults = useMemo(
    () => sortResultsByColumn(viewResults, sortConfig),
    [viewResults, sortConfig],
  );

  const visibleResults = useMemo(() => {
    if (showAll) {
      return sortedResults;
    } else {
      return sortedResults.slice(0, DEFAULT_VISIBLE_RESULTS);
    }
  }, [sortedResults, showAll]);

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
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
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
