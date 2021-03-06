import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { green } from '@material-ui/core/colors';
import { times } from '../../../lib/utils';
import { formatAttemptResult } from '../../../lib/attempt-result';
import { orderedResultStats, paddedAttemptResults } from '../../../lib/result';
import RecordTagBadge from '../../RecordTagBadge/RecordTagBadge';

const useStyles = makeStyles((theme) => ({
  row: {
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  ranking: {
    paddingRight: 16,
    width: 50,
  },
  advancing: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

function sortResults(results, orderBy, order) {
  if (orderBy === null) return results;
  return results.slice().sort((result1, result2) => {
    if (orderBy === 'registrantId') {
      const value = result1.person.registrantId - result2.person.registrantId;
      return order === 'asc' ? value : -value;
    }
    if (orderBy === 'name') {
      const value = result1.person.name.localeCompare(result2.person.name);
      return order === 'asc' ? value : -value;
    }
    throw new Error(`Unrecognized order rule: ${orderBy}`);
  });
}

const AdminResultsTable = React.memo(
  ({ results, eventId, format, onResultClick }) => {
    const classes = useStyles();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(null);

    function handleSortClick(property) {
      if (orderBy !== property) {
        setOrderBy(property);
        setOrder('asc');
      } else if (order === 'asc') {
        setOrder('desc');
      } else {
        // Third click on the same column gets back to the default order.
        setOrderBy(null);
        setOrder('asc');
      }
    }

    const stats = orderedResultStats(eventId, format);

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right" className={classes.ranking}>
              #
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'registrantId'}
                direction={order}
                onClick={() => handleSortClick('registrantId')}
              >
                ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={order}
                onClick={() => handleSortClick('name')}
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
              className={classes.row}
              onClick={(event) => onResultClick(result, event)}
            >
              <TableCell
                align="right"
                className={classNames(classes.ranking, {
                  [classes.advancing]: result.advancing,
                })}
              >
                {result.ranking}
              </TableCell>
              <TableCell align="right">{result.person.registrantId}</TableCell>
              <TableCell>{result.person.name}</TableCell>
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
                  className={classNames({
                    [classes.mainStat]: index === 0,
                  })}
                >
                  <RecordTagBadge recordTag={result[recordTagField]} hidePb>
                    {formatAttemptResult(result[field], eventId)}
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

export default AdminResultsTable;
