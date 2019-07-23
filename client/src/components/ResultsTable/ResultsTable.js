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

const ResultsTable = ({
  results,
  format,
  eventId,
  competitionId,
  displayCountry = true,
  displayId = false,
}) => {
  const stats = statsToDisplay(format, eventId);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right">#</TableCell>
          {displayId && <TableCell align="right">ID</TableCell>}
          <TableCell>Name</TableCell>
          {displayCountry && <TableCell>Country</TableCell>}
          {times(format.solveCount, index => (
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
          <TableRow
            key={result.person.id}
            hover
            style={{ whiteSpace: 'nowrap' }}
          >
            <TableCell
              align="right"
              style={result.advancable ? { backgroundColor: 'lightgreen' } : {}}
            >
              {result.ranking}
            </TableCell>
            {displayId && (
              <TableCell align="right">{result.person.id}</TableCell>
            )}
            <TableCell>
              <Link
                component={RouterLink}
                to={`/competitions/${competitionId}/competitors/${result.person.id}`}
              >
                {result.person.name}
              </Link>
            </TableCell>
            {displayCountry && (
              <TableCell>{result.person.country.name}</TableCell>
            )}
            {result.attempts.map((attempt, index) => (
              <TableCell key={index} align="right">
                {formatResult(attempt, eventId)}
              </TableCell>
            ))}
            {stats.map(({ name, type, fn }, index) => (
              <TableCell
                key={name}
                align="right"
                style={index === 0 ? { fontWeight: 600 } : {}}
              >
                {formatResult(
                  fn(result.attempts, eventId),
                  eventId,
                  fn === average
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ResultsTable;
