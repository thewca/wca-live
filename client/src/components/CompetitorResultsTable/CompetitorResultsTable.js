import React, { useState, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Hidden from '@material-ui/core/Hidden';
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
import CompetitorResultDialog from '../CompetitorResultDialog/CompetitorResultDialog';
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
  ranking: {
    width: 75,
    [theme.breakpoints.down('sm')]: {
      width: 40,
    },
  },
  advancable: {
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

const CompetitorResultsTable = ({ results, competitionId }) => {
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedResult, setSelectedResult] = useState(null);

  /* Assume every round has the same format. */
  const { format, event } = results[0].round;
  const stats = statsToDisplay(format, event.id);

  const solveCount = Math.max(
    results.map(result => result.round.format.solveCount)
  );

  return (
    <Fragment>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              className={classNames(classes.cell, classes.ranking)}
              align="right"
            >
              #
            </TableCell>
            <TableCell className={classes.cell}>Round</TableCell>
            <Hidden smDown>
              {times(solveCount, index => (
                <TableCell key={index} align="right">
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
              key={result.round.id}
              hover
              className={classes.row}
              onClick={smallScreen ? () => setSelectedResult(result) : null}
            >
              <TableCell
                align="right"
                className={classNames(classes.cell, classes.ranking, {
                  [classes.advancable]: result.advancable,
                })}
              >
                {result.ranking}
              </TableCell>
              <TableCell className={classes.cell}>
                {smallScreen ? (
                  result.round.name
                ) : (
                  <Link
                    component={RouterLink}
                    to={`/competitions/${competitionId}/rounds/${result.round.id}`}
                  >
                    {result.round.name}
                  </Link>
                )}
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
                  className={classNames(classes.cell, {
                    [classes.mainStat]: index === 0,
                  })}
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
      {smallScreen && (
        <CompetitorResultDialog
          result={selectedResult}
          competitionId={competitionId}
          stats={stats}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </Fragment>
  );
};

export default CompetitorResultsTable;
