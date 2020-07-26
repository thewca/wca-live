import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Hidden from '@material-ui/core/Hidden';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import green from '@material-ui/core/colors/green';

import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../lib/utils';
import { formatAttemptResult } from '../../lib/attempt-result';
import { orderedResultStats } from '../../lib/view-utils';

const useStyles = makeStyles((theme) => ({
  table: {
    tableLayout: 'fixed',
  },
  row: {
    whiteSpace: 'nowrap',
  },
  cell: {},
  ranking: {
    paddingRight: 16,
    width: 50,
    [theme.breakpoints.down('sm')]: {
      paddingRight: 8,
      width: 40,
    },
  },
  roundName: {
    width: 200,
    [theme.breakpoints.down('md')]: {
      width: 150,
    },
  },
  advancing: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

function CompetitorResultsTable({ results, competitionId, onResultClick }) {
  const classes = useStyles();

  /* Assume every round has the same format. */
  const {
    format,
    competitionEvent: { event },
  } = results[0].round;
  const stats = orderedResultStats(format, event.id);

  const numberOfAttempts = Math.max(
    ...results.map((result) => result.round.format.numberOfAttempts)
  );

  return (
    <Table size="small" className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell
            className={classNames(classes.cell, classes.ranking)}
            align="right"
          >
            #
          </TableCell>
          <TableCell className={classNames(classes.cell, classes.roundName)}>
            Round
          </TableCell>
          <Hidden xsDown>
            {times(numberOfAttempts, (index) => (
              <TableCell key={index} align="right">
                {index + 1}
              </TableCell>
            ))}
          </Hidden>
          {stats.map(({ name }) => (
            <TableCell key={name} className={classes.cell} align="right">
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
            className={classes.row}
            onClick={(event) => onResultClick(result, event)}
          >
            <TableCell
              align="right"
              className={classNames(classes.cell, classes.ranking, {
                [classes.advancing]: result.advancing,
              })}
            >
              {result.ranking}
            </TableCell>
            <TableCell className={classNames(classes.cell, classes.roundName)}>
              <Hidden xsDown>
                <Link
                  component={RouterLink}
                  to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                >
                  {result.round.name}
                </Link>
              </Hidden>
              <Hidden smUp>{result.round.name}</Hidden>
            </TableCell>
            <Hidden xsDown>
              {times(numberOfAttempts, (index) => (
                <TableCell key={index} align="right">
                  {formatAttemptResult(
                    result.attempts[index] ? result.attempts[index].result : 0,
                    event.id
                  )}
                </TableCell>
              ))}
            </Hidden>
            {stats.map(({ name, field, recordTagField }, index) => (
              <TableCell
                key={name}
                align="right"
                className={classNames(classes.cell, {
                  [classes.mainStat]: index === 0,
                })}
              >
                <ResultWithRecordTag
                  result={formatAttemptResult(result[field], event.id)}
                  recordTag={result[recordTagField]}
                  showPb={true}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default CompetitorResultsTable;
