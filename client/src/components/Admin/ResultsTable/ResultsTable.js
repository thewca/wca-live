import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { centisecondsToClockFormat } from '../../../logic/utils';
import { best, average } from '../../../logic/calculations';

const ResultsTable = ({ results }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right">#</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Country</TableCell>
          {[1, 2, 3, 4, 5].map(n => (
            <TableCell key={n} align="right">{n}</TableCell>
          ))}
          <TableCell align="right">Average</TableCell>
          <TableCell align="right">Best</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map(result => (
          <TableRow key={result.person.id} hover>
            <TableCell
              align="right"
              style={result.advancable ? { backgroundColor: 'lightgreen' } : {}}
            >
              {result.ranking}
            </TableCell>
            <TableCell>{result.person.name}</TableCell>
            <TableCell>{result.person.countryIso2}</TableCell>
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
