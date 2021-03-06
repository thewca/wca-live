import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  AppBar,
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
} from '@material-ui/core';
import { green, grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import FlagIcon from '../FlagIcon/FlagIcon';
import { times } from '../../lib/utils';
import { formatAttemptResult } from '../../lib/attempt-result';
import { orderedResultStats, paddedAttemptResults } from '../../lib/result';
import RecordTagBadge from '../RecordTagBadge/RecordTagBadge';

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: '100vh',
    overflow: 'hidden',
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    color: theme.palette.type === 'dark' ? '#fff' : null,
    backgroundColor: theme.palette.type === 'dark' ? grey['900'] : null,
  },
  table: {
    tableLayout: 'fixed',
  },
  row: {
    whiteSpace: 'nowrap',
  },
  cell: {
    fontSize: '1.5rem',
    paddingRight: 0,
    '&:last-child': {
      paddingRight: 32,
    },
  },
  ranking: {
    width: 75,
    paddingRight: 16,
  },
  advancing: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  name: {
    width: '22%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  country: {
    width: 50,
  },
  mainStat: {
    fontWeight: 600,
  },
}));

const STATUS = {
  SHOWING: Symbol('showing'),
  SHOWN: Symbol('shown'),
  HIDING: Symbol('hiding'),
};

const DURATION = {
  SHOWN: 10 * 1000,
  SHOWING: 1000,
  HIDING: 1000,
};

/* (window height - app bar - table header) / row height */
function getNumberOfRows() {
  return Math.floor((window.innerHeight - 64 - 50) / 63);
}

function ResultsProjector({ results, format, eventId, title, exitUrl }) {
  const classes = useStyles();
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
      TransitionProps={{ direction: 'up' }}
      transitionDuration={500}
    >
      <div className={classes.root}>
        <AppBar position="sticky" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h4" color="inherit">
              {title}
            </Typography>
            <div className={classes.grow} />
            <IconButton color="inherit" component={Link} to={exitUrl}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell
                className={classNames(classes.cell, classes.ranking)}
                align="right"
              >
                #
              </TableCell>
              <TableCell className={classNames(classes.cell, classes.name)}>
                Name
              </TableCell>
              <TableCell
                className={classNames(classes.cell, classes.country)}
              ></TableCell>
              {times(format.numberOfAttempts, (index) => (
                <TableCell key={index} className={classes.cell} align="right">
                  {index + 1}
                </TableCell>
              ))}
              {stats.map(({ name }) => (
                <TableCell key={name} className={classes.cell} align="right">
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
                  <TableRow className={classes.row}>
                    <TableCell
                      align="right"
                      className={classNames(classes.cell, classes.ranking, {
                        [classes.advancing]: result.advancing,
                      })}
                    >
                      {result.ranking}
                    </TableCell>
                    <TableCell
                      className={classNames(classes.cell, classes.name)}
                    >
                      {result.person.name}
                    </TableCell>
                    <TableCell className={classes.cell} align="center">
                      <FlagIcon
                        code={result.person.country.iso2.toLowerCase()}
                      />
                    </TableCell>
                    {paddedAttemptResults(result, format.numberOfAttempts).map(
                      (attemptResult, index) => (
                        <TableCell
                          key={index}
                          align="right"
                          className={classes.cell}
                        >
                          {formatAttemptResult(attemptResult, eventId)}
                        </TableCell>
                      )
                    )}
                    {stats.map(({ name, field, recordTagField }, index) => (
                      <TableCell
                        key={name}
                        align="right"
                        className={classNames(classes.cell, {
                          [classes.mainStat]: index === 0,
                        })}
                      >
                        <RecordTagBadge
                          recordTag={result[recordTagField]}
                          hidePb
                        >
                          {formatAttemptResult(result[field], eventId)}
                        </RecordTagBadge>
                      </TableCell>
                    ))}
                  </TableRow>
                </Fade>
              ))}
          </TableBody>
        </Table>
      </div>
    </Dialog>
  );
}

export default ResultsProjector;
