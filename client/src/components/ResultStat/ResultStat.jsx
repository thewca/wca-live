import { Box, Tooltip } from "@mui/material";
import {
  bestPossibleAverage,
  worstPossibleAverage,
  formatAttemptResult,
  timeNeededToWin,
} from "../../lib/attempt-result";
import { shouldComputeAverage } from "../../lib/result";

function ResultStat({ result, field, eventId, format, projectedFirst, projectedPodium}) {
  if (
    field === "average" &&
    result.average === 0 &&
    shouldComputeAverage(eventId, format.numberOfAttempts)
  ) {
    const attemptResults = result.attempts.map((attempt) => attempt.result);

    if (format.numberOfAttempts === 5 && result.attempts.length === 4) {
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Projected average">
            <span>
              {formatAttemptResult(
                result.projected,
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

    if (format.numberOfAttempts === 5 && result.attempts.length < 4) {
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Projected average">
            <span>
              {formatAttemptResult(
                result.projected,
                eventId
              )}
            </span>
          </Tooltip>
        </Box>
      );
    }

    if (format.numberOfAttempts === 3 && result.attempts.length < 3) {
      return (
        <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Projected mean">
            <span>
              {formatAttemptResult(
                result.projected,
                eventId
              )}
            </span>
          </Tooltip>
        </Box>
      );
    }
  }

  if (field === "xtowin") {    
    if (!projectedFirst || result.ranking < 2 || result.attempts.length === format.numberOfAttempts) {
      return;
    }
    return (
      <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Time needed to win">
            <span>
            {formatAttemptResult(
                timeNeededToWin(result, projectedFirst, format), 
                eventId 
              )}
            </span>
          </Tooltip>
        </Box>

    )

  }

  if (field === "xtopodium") {    
    if (!projectedPodium || result.ranking < 4 || result.attempts.length === format.numberOfAttempts) {
      return;
    }
    return (
      <Box component="span" sx={{ opacity: 0.5 }}>
          <Tooltip title="Time needed to podium">
            <span>
            {formatAttemptResult(
                timeNeededToWin(result, projectedPodium, format), 
                eventId 
              )}
            </span>
          </Tooltip>
        </Box>

    )

  }

  return formatAttemptResult(result[field], eventId);
}

export default ResultStat;
