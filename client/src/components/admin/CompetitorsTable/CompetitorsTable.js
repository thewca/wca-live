import React, { useState, useMemo } from 'react';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import CubingIcon from '../../CubingIcon/CubingIcon';
import { wcaUrl } from '../../../logic/url-utils';

const useStyles = makeStyles(theme => ({
  row: {
    whiteSpace: 'nowrap',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  awaitingResults: {
    opacity: 0.5,
  },
}));

const CompetitorsTable = React.memo(({ competitors, events }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const handleSearchChange = event => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedCompetitors = useMemo(() => {
    return competitors
      .slice()
      .sort((person1, person2) => person1.name.localeCompare(person2.name));
  }, [competitors]);
  const filteredCompetitors = search
    ? sortedCompetitors.filter(competitor => {
        const matchAgainst = [
          competitor.name,
          competitor.wcaId,
          competitor.country.name,
        ];
        return search
          .toLowerCase()
          .split(/\s+/)
          .every(part =>
            matchAgainst.some(
              phrase => phrase && phrase.toLowerCase().includes(part)
            )
          );
      })
    : sortedCompetitors;
  const displayedCompetitors = filteredCompetitors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <Toolbar>
        <TextField
          label="Search"
          value={search}
          onChange={handleSearchChange}
        />
      </Toolbar>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right">#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>WCA ID</TableCell>
              <TableCell align="center" colSpan={events.length}>
                Events
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedCompetitors.map(person => (
              <TableRow key={person.id} hover className={classes.row}>
                <TableCell align="right">{person.id}</TableCell>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.country.name}</TableCell>
                <TableCell>
                  {person.wcaId && (
                    <Link
                      href={wcaUrl(`/persons/${person.wcaId}`)}
                      target="_blank"
                    >
                      {person.wcaId}
                    </Link>
                  )}
                </TableCell>
                {events.map(event => {
                  const result = event.rounds[0].results.find(
                    result => result.person.id === person.id
                  );
                  return (
                    <TableCell
                      key={event.id}
                      align="center"
                      className={classNames({
                        [classes.awaitingResults]:
                          result && result.attempts.length === 0,
                      })}
                      padding="none"
                    >
                      {result && (
                        <Tooltip
                          title={
                            result.attempts.length > 0
                              ? 'Competed'
                              : 'Awaiting results'
                          }
                          placement="top"
                        >
                          <span>
                            <CubingIcon eventId={event.id} small={true} />
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={competitors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
      />
    </Paper>
  );
});

export default CompetitorsTable;
