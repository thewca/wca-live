import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

import FlagIcon from '../FlagIcon/FlagIcon';
import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../lib/utils';
import { formatAttemptResult } from '../../lib/attempts';
import { statsToDisplay } from '../../lib/results-table-utils';

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
  advancable: {
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
const getNumberOfRows = () => Math.floor((window.innerHeight - 64 - 50) / 63);

const ResultsProjector = ({
  results,
  format,
  eventId,
  title,
  competitionId,
  exitUrl,
}) => {
  const classes = useStyles();
  const [status, setStatus] = useState(STATUS.SHOWING);
  const [topResultIndex, setTopResultIndex] = useState(0);

  const stats = statsToDisplay(format, eventId);

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
    throw new Error(`Unrecoginsed status: ${status}`);
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
              {times(format.solveCount, (index) => (
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
                        [classes.advancable]: result.advancable,
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
                    {times(format.solveCount, (index) => (
                      <TableCell
                        key={index}
                        className={classes.cell}
                        align="right"
                      >
                        {formatAttemptResult(
                          result.attempts[index] || 0,
                          eventId
                        )}
                      </TableCell>
                    ))}
                    {stats.map(({ name, type, recordType }, index) => (
                      <TableCell
                        key={name}
                        align="right"
                        className={classNames(classes.cell, {
                          [classes.mainStat]: index === 0,
                        })}
                      >
                        <ResultWithRecordTag
                          result={formatAttemptResult(
                            result[type],
                            eventId,
                            type === 'average'
                          )}
                          recordTag={result.recordTags[recordType]}
                          showPb={false}
                        />
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
};

export default ResultsProjector;
