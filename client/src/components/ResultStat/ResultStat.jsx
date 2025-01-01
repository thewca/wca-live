import { Box, Tooltip } from "@mui/material";
import {
  bestPossibleAverage,
  worstPossibleAverage,
  formatAttemptResult,
  // timeNeededToWin,
} from "../../lib/attempt-result";
import { shouldComputeAverage } from "../../lib/result";

function ResultStat({ result, field, eventId, format, forecastView
  }) {
  if (
    field === "average" &&
    result.average === 0 &&
    shouldComputeAverage(eventId, format.numberOfAttempts)
  ) {
    const attemptResults = result.attempts.map((attempt) => attempt.result);
    // clean up duplicated code
    if (forecastView) {
      if (format.numberOfAttempts === 5 && result.attempts.length === 4) {
        return (
          <Box component="span" sx={{ opacity: 0.5 }}>
            <Tooltip title="Projected average">
              <span>
                {formatAttemptResult(
                  result.projectedAverage,
                  eventId
                )}
              </span>
            </Tooltip>
            {" ("}
            <Tooltip title="Best possible average">
              <span>
                {formatAttemptResult(
                  bestPossibleAverage(attemptResults),
                  eventId
                )}
              </span>
            </Tooltip>
            {" / "}
            <Tooltip title="Worst possible average">
              <span>
                {formatAttemptResult(
                  worstPossibleAverage(attemptResults),
                  eventId
                )}
              </span>
            </Tooltip>
            {")"}
          </Box>
        );
      }
  
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Projected average">
            <span>
              {formatAttemptResult(
                result.projectedAverage,
                eventId
              )}
            </span>
          </Tooltip>
        </Box>
      );
    }

    if (format.numberOfAttempts === 5 && result.attempts.length === 4) {
        return (
          <Box component="span" sx={{ opacity: 0.5 }}>
            <Tooltip title="Best possible average">
              <span>
                {formatAttemptResult(
                  bestPossibleAverage(attemptResults),
                  eventId
                )}
              </span>
            </Tooltip>
            {" / "}
            <Tooltip title="Worst possible average">
              <span>
                {formatAttemptResult(
                  worstPossibleAverage(attemptResults),
                  eventId
                )}
              </span>
            </Tooltip>
          </Box>
        );
      }
  }
  return formatAttemptResult(result[field], eventId);
}

export default ResultStat;
