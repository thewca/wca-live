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
import { times } from '../../logic/utils';
import { formatAttemptResult } from '../../logic/attempts';
import { statsToDisplay } from '../../logic/results-table-utils';

const useStyles = makeStyles(theme => ({
  row: {
    whiteSpace: 'nowrap',
  },
  cell: {
    [theme.breakpoints.down('sm')]: {
      paddingRight: 6,
      paddingLeft: 10,
    },
  },
  ranking: {
    paddingRight: 16,
    width: 50,
    [theme.breakpoints.down('sm')]: {
      paddingRight: 8,
      width: 40,
    },
  },
  advancable: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

const CompetitorResultsTable = ({ results, competitionId, onResultClick }) => {
  const classes = useStyles();

  /* Assume every round has the same format. */
  const { format, event } = results[0].round;
  const stats = statsToDisplay(format, event.id);

  const solveCount = Math.max(
    ...results.map(result => result.round.format.solveCount)
  );

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell
            className={classNames(classes.cell, classes.ranking)}
            align="right"
          >
            #
          </TableCell>
          <TableCell className={classes.cell}>Round</TableCell>
          <Hidden smDown>
            {times(solveCount, index => (
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
        {results.map(result => (
          <TableRow
            key={result.round.id}
            hover
            className={classes.row}
            onClick={event => onResultClick(result, event)}
          >
            <TableCell
              align="right"
              className={classNames(classes.cell, classes.ranking, {
                [classes.advancable]: result.advancable,
              })}
            >
              {result.ranking}
            </TableCell>
            <TableCell className={classes.cell}>
              <Hidden smDown>
                <Link
                  component={RouterLink}
                  to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                >
                  {result.round.name}
                </Link>
              </Hidden>
              <Hidden mdUp>{result.round.name}</Hidden>
            </TableCell>
            <Hidden smDown>
              {times(solveCount, index => (
                <TableCell key={index} align="right">
                  {formatAttemptResult(result.attempts[index] || 0, event.id)}
                </TableCell>
              ))}
            </Hidden>
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
                    event.id,
                    type === 'average'
                  )}
                  recordTag={result.recordTags[recordType]}
                  showPb={true}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CompetitorResultsTable;
