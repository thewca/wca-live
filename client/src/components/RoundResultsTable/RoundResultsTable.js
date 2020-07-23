import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Hidden from '@material-ui/core/Hidden';
import Link from '@material-ui/core/Link';
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
import { statsToDisplay } from '../../lib/results-table-utils';

const useStyles = makeStyles((theme) => ({
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
  advancing: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  name: {
    maxWidth: 250,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    paddingRight: 0,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 150,
    },
  },
  mainStat: {
    fontWeight: 600,
  },
}));

// TODO: pass just round?
const RoundResultsTable = React.memo(
  ({ results, format, eventId, competitionId, onResultClick }) => {
    const classes = useStyles();
    const stats = statsToDisplay(format, eventId);

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
            <TableCell className={classes.cell}>Name</TableCell>
            <Hidden smDown>
              <TableCell className={classes.cell}>Country</TableCell>
            </Hidden>
            <Hidden xsDown>
              {times(format.numberOfAttempts, (index) => (
                <TableCell key={index} className={classes.cell} align="right">
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
              key={result.id}
              hover
              className={classes.row}
              onClick={(event) => onResultClick && onResultClick(result, event)}
            >
              <TableCell
                align="right"
                className={classNames(classes.cell, classes.ranking, {
                  [classes.advancing]: result.advancing,
                })}
              >
                {result.ranking}
              </TableCell>
              <TableCell className={classNames(classes.cell, classes.name)}>
                <Hidden xsDown>
                  <Link
                    component={RouterLink}
                    to={`/competitions/${competitionId}/competitors/${result.person.id}`}
                  >
                    {result.person.name}
                  </Link>
                </Hidden>
                <Hidden smUp>{result.person.name}</Hidden>
              </TableCell>
              <Hidden smDown>
                <TableCell className={classes.cell}>
                  {result.person.country.name}
                </TableCell>
              </Hidden>
              <Hidden xsDown>
                {times(format.numberOfAttempts, (index) => (
                  <TableCell key={index} className={classes.cell} align="right">
                    {formatAttemptResult(
                      result.attempts[index]
                        ? result.attempts[index].result
                        : 0,
                      eventId
                    )}
                  </TableCell>
                ))}
              </Hidden>
              {stats.map(({ name, type, recordTagField }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  className={classNames(classes.cell, {
                    [classes.mainStat]: index === 0,
                  })}
                >
                  <ResultWithRecordTag
                    result={formatAttemptResult(result[type], eventId)}
                    recordTag={result[recordTagField]}
                    showPb={false}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);

export default RoundResultsTable;
