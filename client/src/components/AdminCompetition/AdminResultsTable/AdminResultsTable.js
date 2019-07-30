import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ResultWithRecordTag from '../../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../../logic/utils';
import { formatResult } from '../../../logic/results';
import { statsToDisplay } from '../../../logic/results-table-utils';

const AdminResultsTable = ({
  results,
  format,
  eventId,
  competitionId,
  onResultClick,
}) => {
  const stats = statsToDisplay(format, eventId);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="right" style={{ width: 75 }}>
            #
          </TableCell>
          <TableCell align="right">ID</TableCell>
          <TableCell>Name</TableCell>
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
            style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={event => onResultClick(event, result)}
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
            <TableCell align="right">{result.person.id}</TableCell>
            <TableCell>{result.person.name}</TableCell>
            {times(format.solveCount, index => (
              <TableCell key={index} align="right">
                {formatResult(result.attempts[index] || 0, eventId)}
              </TableCell>
            ))}
            {stats.map(({ name, fn, type }, index) => (
              <TableCell
                key={name}
                align="right"
                style={index === 0 ? { fontWeight: 600 } : {}}
              >
                <ResultWithRecordTag
                  result={formatResult(
                    fn(result.attempts, eventId),
                    eventId,
                    type === 'average'
                  )}
                  recordTag={result.recordTags[type]}
                  showPb={false}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminResultsTable;
