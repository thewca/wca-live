import { Box, Tooltip } from "@mui/material";
import { formatAttemptResultForView } from "../../lib/result";
import { isSkipped } from "../../lib/attempt-result";

function ResultStat({ result, field, eventId, forecastView }) {
  if (field === "average" && isSkipped(result.average) && forecastView) {
    return (
      <Box component="span" sx={{ opacity: 0.5 }}>
        <Tooltip title="Projected average">
          <span>
            {formatAttemptResultForView(result.projectedAverage, eventId)}
          </span>
        </Tooltip>
      </Box>
    );
  }

  return formatAttemptResultForView(result[field], eventId);
}

export default ResultStat;
