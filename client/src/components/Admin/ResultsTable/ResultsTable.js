import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { centisecondsToClockFormat, times } from '../../../logic/utils';
import { best, average } from '../../../logic/calculations';

const ResultsTable = ({ results, format }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right">#</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Country</TableCell>
          {times(format.solveCount, index => (
            <TableCell key={index} align="right">
              {index + 1}
            </TableCell>
          ))}
          <TableCell align="right">Average</TableCell>
          <TableCell align="right">Best</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map(result => (
          <TableRow key={result.person.id} hover style={{ whiteSpace: 'nowrap' }}>
            <TableCell
              align="right"
              style={result.advancable ? { backgroundColor: 'lightgreen' } : {}}
            >
              {result.ranking}
            </TableCell>
            <TableCell>{result.person.name}</TableCell>
            <TableCell>{result.person.country.name}</TableCell>
            {result.attempts.map((attempt, index) => (
              <TableCell key={index} align="right">
                {centisecondsToClockFormat(attempt)}
              </TableCell>
            ))}
            <TableCell align="right">
              {centisecondsToClockFormat(average(result.attempts))}
            </TableCell>
            <TableCell align="right">
              {centisecondsToClockFormat(best(result.attempts))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ResultsTable;
