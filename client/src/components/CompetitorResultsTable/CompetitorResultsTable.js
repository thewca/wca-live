import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { times } from '../../logic/utils';
import { formatResult } from '../../logic/results';
import { best, average } from '../../logic/calculations';

/* TODO: code duplication from ResultsTable, move someplace else (?) */
const statsToDisplay = (format, eventId) => {
  const { solveCount, sortBy } = format;
  const computeAverage = [3, 5].includes(solveCount) && eventId !== '333mbf';
  if (!computeAverage) return [{ name: 'Best', fn: best }];
  const stats = [
    { name: 'Best', fn: best },
    { name: solveCount === 3 ? 'Mean' : 'Average', fn: average },
  ];
  return sortBy === 'best' ? stats : stats.reverse();
};

const CompetitorResultsTable = ({ results, competitionId }) => {
  const { format, event } = results[0].round; /* Assume every round has the same format. */
  const stats = statsToDisplay(format, event.id);

  const solveCount = Math.max(results.map(result => result.round.format.solveCount));

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right" style={{ width: 75 }}>#</TableCell>
          <TableCell>Round</TableCell>
          {times(solveCount, index => (
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
        {results.map(result => (
          <TableRow key={result.round.id} hover style={{ whiteSpace: 'nowrap' }}>
            <TableCell
              align="right"
              style={result.advancable ? { backgroundColor: 'lightgreen', width: 75 } : { width: 75 }}
            >
              {result.ranking}
            </TableCell>
            <TableCell>
              <Link component={RouterLink} to={`/competitions/${competitionId}/rounds/${result.round.id}`}>
                {result.round.name}
              </Link>
            </TableCell>
            {times(solveCount, index => (
              <TableCell key={index} align="right">
                {formatResult(result.attempts[index] || 0, event.id)}
              </TableCell>
            ))}
            {stats.map(({ name, type, fn }, index) => (
              <TableCell key={name} align="right" style={index === 0 ? { fontWeight: 600 } : {}}>
                {formatResult(fn(result.attempts, event.id), event.id, fn === average)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CompetitorResultsTable;
