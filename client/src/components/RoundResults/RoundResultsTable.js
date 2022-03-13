import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
} from '@mui/material';
import { green } from '@mui/material/colors';
import { times } from '../../lib/utils';
import { formatAttemptResult } from '../../lib/attempt-result';
import { orderedResultStats, paddedAttemptResults } from '../../lib/result';
import RecordTagBadge from '../RecordTagBadge/RecordTagBadge';

const styles = {
  cell: {
    pr: { xs: '6px', md: '16px' },
    pl: { xs: '10px', md: '16px' },
    '&:last-child': {
      pr: 2,
    },
  },
  ranking: {
    pr: { xs: 1, md: 2 },
    width: { xs: 40, md: 50 },
  },
  advancing: {
    color: (theme) => theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  name: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    pr: 0,
    maxWidth: { xs: 150, md: 250 },
  },
};

const RoundResultsTable = React.memo(
  ({ results, format, eventId, competitionId, onResultClick }) => {
    const smScreen = useMediaQuery((theme) => theme.breakpoints.up('sm'));
    const mdScreen = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const stats = orderedResultStats(eventId, format);

    return (
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ ...styles.cell, ...styles.ranking }}
                align="right"
              >
                #
              </TableCell>
              <TableCell sx={styles.cell}>Name</TableCell>
              {mdScreen && <TableCell sx={styles.cell}>Country</TableCell>}
              {smScreen &&
                times(format.numberOfAttempts, (index) => (
                  <TableCell key={index} sx={styles.cell} align="right">
                    {index + 1}
                  </TableCell>
                ))}
              {stats.map(({ name }) => (
                <TableCell key={name} sx={styles.cell} align="right">
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
                sx={{
                  whiteSpace: 'nowrap',
                  '&:last-child td': { border: 0 },
                }}
                onClick={() => onResultClick && onResultClick(result)}
              >
                <TableCell
                  align="right"
                  sx={{
                    ...styles.cell,
                    ...styles.ranking,
                    ...(result.advancing ? styles.advancing : {}),
                  }}
                >
                  {result.ranking}
                </TableCell>
                <TableCell sx={{ ...styles.cell, ...styles.name }}>
                  {smScreen ? (
                    <Link
                      component={RouterLink}
                      to={`/competitions/${competitionId}/competitors/${result.person.id}`}
                      underline="hover"
                    >
                      {result.person.name}
                    </Link>
                  ) : (
                    result.person.name
                  )}
                </TableCell>
                {mdScreen && (
                  <TableCell sx={styles.cell}>
                    {result.person.country.name}
                  </TableCell>
                )}
                {smScreen &&
                  paddedAttemptResults(result, format.numberOfAttempts).map(
                    (attemptResult, index) => (
                      <TableCell key={index} align="right" sx={styles.cell}>
                        {formatAttemptResult(attemptResult, eventId)}
                      </TableCell>
                    )
                  )}
                {stats.map(({ name, field, recordTagField }, index) => (
                  <TableCell
                    key={name}
                    align="right"
                    sx={{
                      ...styles.cell,
                      fontWeight: index === 0 ? 600 : 400,
                    }}
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
      </Paper>
    );
  }
);

export default RoundResultsTable;
