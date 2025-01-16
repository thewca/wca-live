import { Link as RouterLink } from "react-router-dom";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import { times } from "../../lib/utils";
import { formatAttemptResult } from "../../lib/attempt-result";
import { orderedResultStats, paddedAttemptResults } from "../../lib/result";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";

const styles = {
  ranking: {
    pr: { xs: 1, md: 2 },
    width: { xs: 40, md: 50 },
  },
  advancing: {
    color: (theme) => theme.palette.getContrastText(green["A400"]),
    backgroundColor: green["A400"],
  },
  advancingQuestionable: {
    color: (theme) => theme.palette.getContrastText(alpha(green["A400"], 0.5)),
    backgroundColor: alpha(green["A400"], 0.5),
  },
  roundName: {
    width: { xs: 150, lg: 200 },
  },
};

function CompetitorResultsTable({ results, competitionId, onResultClick }) {
  const smScreen = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  /* Assume every round has the same format. */
  const {
    format,
    competitionEvent: { event },
  } = results[0].round;
  const stats = orderedResultStats(event.id, format);

  const numberOfAttempts = Math.max(
    ...results.map((result) => result.round.format.numberOfAttempts)
  );

  return (
    <Paper>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell align="right" sx={styles.ranking}>
              #
            </TableCell>
            <TableCell sx={styles.roundName}>Round</TableCell>
            {smScreen &&
              times(numberOfAttempts, (index) => (
                <TableCell key={index} align="right">
                  {index + 1}
                </TableCell>
              ))}
            {stats.map(({ name }) => (
              <TableCell key={name} align="right">
                {name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow
              key={result.round.id}
              hover
              sx={{ whiteSpace: "nowrap", "&:last-child td": { border: 0 } }}
              onClick={(event) => onResultClick(result, event)}
            >
              <TableCell
                align="right"
                sx={{
                  ...styles.ranking,
                  ...(result.advancing ? styles.advancing : {}),
                  ...(result.advancingQuestionable
                    ? styles.advancingQuestionable
                    : {}),
                }}
              >
                {result.ranking}
              </TableCell>
              <TableCell sx={styles.roundName}>
                {smScreen ? (
                  <Link
                    component={RouterLink}
                    to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                    underline="hover"
                  >
                    {result.round.name}
                  </Link>
                ) : (
                  result.round.name
                )}
              </TableCell>
              {smScreen &&
                paddedAttemptResults(result, format.numberOfAttempts).map(
                  (attemptResult, index) => (
                    <TableCell key={index} align="right">
                      {formatAttemptResult(attemptResult, event.id)}
                    </TableCell>
                  )
                )}
              {stats.map(({ name, field, recordTagField }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  sx={{
                    fontWeight: index === 0 ? 600 : 400,
                  }}
                >
                  <RecordTagBadge recordTag={result[recordTagField]}>
                    {formatAttemptResult(result[field], event.id)}
                  </RecordTagBadge>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default CompetitorResultsTable;
