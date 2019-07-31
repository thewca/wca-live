import React, { Fragment, useState } from 'react';
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
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import ResultWithRecordTag from '../ResultWithRecordTag/ResultWithRecordTag';
import ResultDialog from '../ResultDialog/ResultDialog';
import { times } from '../../logic/utils';
import { formatResult } from '../../logic/results';
import { statsToDisplay } from '../../logic/results-table-utils';

const useStyles = makeStyles(theme => ({
  row: {
    whiteSpace: 'nowrap',
  },
  cell: {
    [theme.breakpoints.down('sm')]: {
      paddingRight: 6,
      paddingLeft: 10,
    },
  },
  name: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 150,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: 0,
    },
  },
  advancable: {
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

const ResultsTable = ({ results, format, eventId, competitionId }) => {
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedResult, setSelectedResult] = useState(null);
  const stats = statsToDisplay(format, eventId);

  return (
    <Fragment>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell} align="right">
              #
            </TableCell>
            <TableCell className={classes.cell}>Name</TableCell>
            <Hidden smDown>
              <TableCell className={classes.cell}>Country</TableCell>
              {times(format.solveCount, index => (
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
          {results.map(result => (
            <TableRow
              key={result.person.id}
              hover
              className={classes.row}
              onClick={smallScreen ? () => setSelectedResult(result) : null}
            >
              <TableCell
                align="right"
                className={classNames(classes.cell, {
                  [classes.advancable]: result.advancable,
                })}
              >
                {result.ranking}
              </TableCell>
              <TableCell className={classNames(classes.cell, classes.name)}>
                {smallScreen ? (
                  result.person.name
                ) : (
                  <Link
                    component={RouterLink}
                    to={`/competitions/${competitionId}/competitors/${result.person.id}`}
                  >
                    {result.person.name}
                  </Link>
                )}
              </TableCell>
              <Hidden smDown>
                <TableCell>{result.person.country.name}</TableCell>
                {times(format.solveCount, index => (
                  <TableCell key={index} align="right">
                    {formatResult(result.attempts[index] || 0, eventId)}
                  </TableCell>
                ))}
              </Hidden>
              {stats.map(({ name, fn, type }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  className={classNames(classes.cell, {
                    [classes.mainStat]: index === 0,
                  })}
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
      {smallScreen && (
        <ResultDialog
          result={selectedResult}
          competitionId={competitionId}
          eventId={eventId}
          stats={stats}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </Fragment>
  );
};

export default ResultsTable;
