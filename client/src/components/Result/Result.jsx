import { Box, Tooltip } from "@mui/material";
import {
  bestPossibleAverage,
  worstPossibleAverage,
  formatAttemptResult,
  incompleteMean,
} from "../../lib/attempt-result";

const Result = ({ result, field, eventId, roundFormat }) => {
  return (
    <>
      {result.average === 0 && field === "average"
        ? roundFormat.id === "a"
          ? result.attempts.length > 3 && (
              <Box component="span" sx={{ opacity: 0.5 }}>
                <Tooltip title="Best possible average">
                  <span>
                    {formatAttemptResult(
                      bestPossibleAverage(
                        result.attempts.map((attempt) => attempt.result)
                      ),
                      eventId
                    )}
                  </span>
                </Tooltip>
                {" / "}
                <Tooltip title="Worst possible average">
                  <span>
                    {formatAttemptResult(
                      worstPossibleAverage(
                        result.attempts.map((attempt) => attempt.result)
                      ),
                      eventId
                    )}
                  </span>
                </Tooltip>
              </Box>
            )
          : roundFormat.id === "m" &&
            result.attempts.length > 1 && (
              <Tooltip title="Mean after 2 solves">
                <Box component="span" sx={{ opacity: 0.5 }}>
                  {formatAttemptResult(
                    incompleteMean(
                      result.attempts.map((attempt) => attempt.result),
                      eventId
                    ),
                    eventId
                  )}
                </Box>
              </Tooltip>
            )
        : formatAttemptResult(result[field], eventId)}
    </>
  );
};

export default Result;
