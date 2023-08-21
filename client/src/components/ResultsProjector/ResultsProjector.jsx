import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Dialog,
  Fade,
  IconButton,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "../FlagIcon/FlagIcon";
import { times } from "../../lib/utils";
import { formatAttemptResult } from "../../lib/attempt-result";
import { orderedResultStats, paddedAttemptResults } from "../../lib/result";
import RecordTagBadge from "../RecordTagBadge/RecordTagBadge";
import ResultStat from "../ResultStat/ResultStat";

const styles = {
  cell: {
    fontSize: "1.5rem",
    pr: 0,
    "&:last-child": {
      pr: 4,
    },
  },
  ranking: {
    width: 75,
    pr: 2,
  },
  advancing: {
    color: (theme) => theme.palette.getContrastText(green["A400"]),
    backgroundColor: green["A400"],
  },
  name: {
    width: "22%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  country: {
    width: 50,
  },
};

const STATUS = {
  SHOWING: Symbol("showing"),
  SHOWN: Symbol("shown"),
  HIDING: Symbol("hiding"),
};

const DURATION = {
  SHOWN: 10 * 1000,
  SHOWING: 1000,
  HIDING: 1000,
};

/* (window height - app bar - table header) / row height */
function getNumberOfRows() {
  return Math.floor((window.innerHeight - 64 - 56) / 67);
}

function ResultsProjector({ results, format, eventId, title, exitUrl }) {
  const [status, setStatus] = useState(STATUS.SHOWING);
  const [topResultIndex, setTopResultIndex] = useState(0);

  const stats = orderedResultStats(eventId, format);

  const nonemptyResults = results.filter(
    (result) => result.attempts.length > 0
  );

  useEffect(() => {
    if (status === STATUS.SHOWN) {
      if (nonemptyResults.length > getNumberOfRows()) {
        const timeout = setTimeout(() => {
          setStatus(STATUS.HIDING);
        }, DURATION.SHOWN);
        return () => clearTimeout(timeout);
      } else {
        return;
      }
    }
    if (status === STATUS.SHOWING) {
      const timeout = setTimeout(() => {
        setStatus(STATUS.SHOWN);
      }, DURATION.SHOWING);
      return () => clearTimeout(timeout);
    }
    if (status === STATUS.HIDING) {
      const timeout = setTimeout(() => {
        setStatus(STATUS.SHOWING);
        setTopResultIndex((topResultIndex) => {
          const newIndex = topResultIndex + getNumberOfRows();
          return newIndex >= nonemptyResults.length ? 0 : newIndex;
        });
      }, DURATION.HIDING);
      return () => clearTimeout(timeout);
    }
    throw new Error(`Unrecognized status: ${status}`);
  }, [status, nonemptyResults.length]);

  return (
    <Dialog
      fullScreen
      open={true}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
      transitionDuration={500}
    >
      <Box
        sx={{
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h4" color="inherit">
              {title}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              component={Link}
              to={exitUrl}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Table
          sx={{
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ ...styles.cell, ...styles.ranking }}
                align="right"
              >
                #
              </TableCell>
              <TableCell sx={{ ...styles.cell, ...styles.name }}>
                Name
              </TableCell>
              <TableCell sx={{ ...styles.cell, ...styles.country }}></TableCell>
              {times(format.numberOfAttempts, (index) => (
                <TableCell key={index} sx={styles.cell} align="right">
                  {index + 1}
                </TableCell>
              ))}
              {stats.map(({ name }) => (
                <TableCell key={name} sx={styles.cell} align="right">
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {nonemptyResults
              .slice(topResultIndex, topResultIndex + getNumberOfRows())
              .map((result, index) => (
                <Fade
                  timeout={{ enter: DURATION.SHOWING, exit: DURATION.HIDING }}
                  style={
                    status === STATUS.SHOWING
                      ? { transitionDelay: `${index * 150}ms` }
                      : {}
                  }
                  in={[STATUS.SHOWING, STATUS.SHOWN].includes(status)}
                  key={result.person.id}
                >
                  <TableRow
                    sx={{
                      whiteSpace: "nowrap",
                      "&:last-child td": { border: 0 },
                    }}
                  >
                    <TableCell
                      align="right"
                      sx={{
                        ...styles.cell,
                        ...styles.ranking,
                        ...(result.advancing ? styles.advancing : {}),
                      }}
                    >
                      {result.ranking}
                    </TableCell>
                    <TableCell sx={{ ...styles.cell, ...styles.name }}>
                      {result.person.name}
                    </TableCell>
                    <TableCell sx={styles.cell} align="center">
                      <FlagIcon
                        code={result.person.country.iso2.toLowerCase()}
                      />
                    </TableCell>
                    {paddedAttemptResults(result, format.numberOfAttempts).map(
                      (attemptResult, index) => (
                        <TableCell key={index} align="right" sx={styles.cell}>
                          {formatAttemptResult(attemptResult, eventId)}
                        </TableCell>
                      )
                    )}
                    {stats.map(({ name, field, recordTagField }, index) => (
                      <TableCell
                        key={name}
                        align="right"
                        sx={{
                          ...styles.cell,
                          fontWeight: index === 0 ? 600 : 400,
                        }}
                      >
                        <RecordTagBadge
                          recordTag={result[recordTagField]}
                          hidePr
                        >
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
                </Fade>
              ))}
          </TableBody>
        </Table>
      </Box>
    </Dialog>
  );
}

export default ResultsProjector;
