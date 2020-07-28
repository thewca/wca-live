import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Hidden,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { green } from '@material-ui/core/colors';
import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../lib/utils';
import { formatAttemptResult } from '../../lib/attempt-result';
import { orderedResultStats, paddedAttemptResults } from '../../lib/results';

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

const RoundResultsTable = React.memo(
  ({ results, format, eventId, competitionId, onResultClick }) => {
    const classes = useStyles();
    const stats = orderedResultStats(eventId, format);

    return (
      <Paper>
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
                onClick={() => onResultClick && onResultClick(result)}
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
                      result={formatAttemptResult(result[field], eventId)}
                      recordTag={result[recordTagField]}
                      showPb={false}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
);

export default RoundResultsTable;
