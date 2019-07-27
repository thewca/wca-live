import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Hidden from '@material-ui/core/Hidden';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../logic/utils';
import { formatResult } from '../../logic/results';
import { statsToDisplay } from '../../logic/results-table-utils';

const CompetitorResultsTable = ({ results, competitionId }) => {
  /* Assume every round has the same format. */
  const { format, event } = results[0].round;
  const stats = statsToDisplay(format, event.id);

  const solveCount = Math.max(
    results.map(result => result.round.format.solveCount)
  );

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right" style={{ width: 75 }}>
            #
          </TableCell>
          <TableCell>Round</TableCell>
          <Hidden smDown>
            {times(solveCount, index => (
              <TableCell key={index} align="right">
                {index + 1}
              </TableCell>
            ))}
          </Hidden>
          {stats.map(({ name }) => (
            <TableCell key={name} align="right">
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
            style={{ whiteSpace: 'nowrap' }}
          >
            <TableCell
              align="right"
              style={
                result.advancable
                  ? { backgroundColor: 'lightgreen', width: 75 }
                  : { width: 75 }
              }
            >
              {result.ranking}
            </TableCell>
            <TableCell>
              <Link
                component={RouterLink}
                to={`/competitions/${competitionId}/rounds/${result.round.id}`}
              >
                {result.round.name}
              </Link>
            </TableCell>
            <Hidden smDown>
              {times(solveCount, index => (
                <TableCell key={index} align="right">
                  {formatResult(result.attempts[index] || 0, event.id)}
                </TableCell>
              ))}
            </Hidden>
            {stats.map(({ name, fn, type }, index) => (
              <TableCell
                key={name}
                align="right"
                style={index === 0 ? { fontWeight: 600 } : {}}
              >
                <ResultWithRecordTag
                  result={formatResult(
                    fn(result.attempts, event.id),
                    event.id,
                    type === 'average'
                  )}
                  recordTag={result.recordTags[type]}
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
