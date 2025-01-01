import { Box, Tooltip } from "@mui/material";
import {
  bestPossibleAverage,
  worstPossibleAverage,
  formatAttemptResult,
  incompleteMean,
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
  
    if (format.numberOfAttempts === 5 && result.attempts.length === 4) {
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          {forecastView &&
            (<>
              <Tooltip title="Projected average">
                <span>
                  {formatAttemptResult(
                    result.projectedAverage,
                    eventId
                  )}
                </span>
              </Tooltip>
              {" ("}
            </>)}
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
          {forecastView && (<>{")"}</>)}
        </Box>
      );
    }
    if (forecastView) {
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
    if (format.numberOfAttempts === 3 && result.attempts.length === 2) {
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Mean after 2 solves">
            <span>
              {formatAttemptResult(
                incompleteMean(attemptResults, eventId),
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
