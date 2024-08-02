import { useState, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { green } from "@mui/material/colors";
import { times } from "../../../lib/utils";
import { formatAttemptResult } from "../../../lib/attempt-result";
import { orderedResultStats, paddedAttemptResults } from "../../../lib/result";
import RecordTagBadge from "../../RecordTagBadge/RecordTagBadge";
import ResultStat from "../../ResultStat/ResultStat";

const styles = {
  ranking: {
    pr: 2,
    width: 50,
  },
  advancing: {
    color: (theme) => theme.palette.getContrastText(green["A400"]),
    backgroundColor: green["A400"],
  },
  advancingQuestionable: {
    color: (theme) => theme.palette.getContrastText(green["A100"]),
    backgroundColor: green["A100"],
  },
};

function sortResults(results, orderBy, order) {
  if (orderBy === null) return results;
  return results.slice().sort((result1, result2) => {
    if (orderBy === "registrantId") {
      const value = result1.person.registrantId - result2.person.registrantId;
      return order === "asc" ? value : -value;
    }
    if (orderBy === "name") {
      const value = result1.person.name.localeCompare(result2.person.name);
      return order === "asc" ? value : -value;
    }
    throw new Error(`Unrecognized order rule: ${orderBy}`);
  });
}

const AdminResultsTable = memo(
  ({ results, eventId, format, onResultClick }) => {
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState(null);

    function handleSortClick(property) {
      if (orderBy !== property) {
        setOrderBy(property);
        setOrder("asc");
      } else if (order === "asc") {
        setOrder("desc");
      } else {
        // Third click on the same column gets back to the default order.
        setOrderBy(null);
        setOrder("asc");
      }
    }

    function resetSort() {
      setOrder("asc");
      setOrderBy(null);
    }

    const stats = orderedResultStats(eventId, format);

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right" sx={styles.ranking}>
              <TableSortLabel hideSortIcon onClick={resetSort}>
                #
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === "registrantId"}
                direction={order}
                onClick={() => handleSortClick("registrantId")}
              >
                ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === "name"}
                direction={order}
                onClick={() => handleSortClick("name")}
              >
                Name
              </TableSortLabel>
            </TableCell>
            {times(format.numberOfAttempts, (index) => (
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
          {sortResults(results, orderBy, order).map((result) => (
            <TableRow
              key={result.person.id}
              hover
              sx={{
                whiteSpace: "nowrap",
                cursor: "pointer",
                "&:last-child td": { border: 0 },
              }}
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
              <TableCell align="right">{result.person.registrantId}</TableCell>
              <TableCell>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div>{result.person.name}</div>
                  {!result.person.wcaId && (
                    <div style={{ display: "flex" }}>
                      <Tooltip title="Newcomer" placement="right">
                        <EmojiPeopleIcon fontSize="small" />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </TableCell>
              {paddedAttemptResults(result, format.numberOfAttempts).map(
                (attemptResult, index) => (
                  <TableCell key={index} align="right">
                    {formatAttemptResult(attemptResult, eventId)}
                  </TableCell>
                )
              )}
              {stats.map(({ name, field, recordTagField }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  sx={{ fontWeight: index === 0 ? 600 : 400 }}
                >
                  <RecordTagBadge recordTag={result[recordTagField]} hidePr>
                    <ResultStat
                      result={result}
                      field={field}
                      eventId={eventId}
                      format={format}
                    />
                  </RecordTagBadge>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);

AdminResultsTable.displayName = "AdminResultsTable";

export default AdminResultsTable;
