import { useState, useMemo, memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Link,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
} from "@mui/material";
import CubingIcon from "../../CubingIcon/CubingIcon";
import { wcaUrl } from "../../../lib/urls";

function searchCompetitors(competitors, search) {
  if (!search) return competitors;

  return competitors.filter((competitor) => {
    const matchAgainst = [
      competitor.name,
      competitor.wcaId,
      competitor.country.name,
      competitor.registrantId.toString(),
    ];
    const parts = search.toLowerCase().split(/\s+/);
    return parts.every((part) =>
      matchAgainst.some(
        (phrase) => phrase && phrase.toLowerCase().includes(part)
      )
    );
  });
}

const AdminCompetitorsTable = memo(
  ({ competitors, competitionEvents, competitionId }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    function handleSearchChange(event) {
      setSearch(event.target.value);
      setPage(0);
    }

    function handlePageChange(event, newPage) {
      setPage(newPage);
    }

    function handleRowsPerPageChange(event) {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }

    const sortedCompetitors = useMemo(() => {
      return competitors
        .slice()
        .sort((person1, person2) => person1.name.localeCompare(person2.name));
    }, [competitors]);

    const filteredCompetitors = searchCompetitors(sortedCompetitors, search);

    const displayedCompetitors = filteredCompetitors.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <Paper>
        <Toolbar>
          <TextField
            variant="standard"
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
                <TableCell align="center" colSpan={competitionEvents.length}>
                  Results
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedCompetitors.map((person) => (
                <TableRow
                  key={person.id}
                  hover
                  sx={{
                    whiteSpace: "nowrap",
                    "&:last-child td": { border: 0 },
                  }}
                >
                  <TableCell align="right">{person.registrantId}</TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/competitions/${competitionId}/competitors/${person.id}`}
                      underline="hover"
                    >
                      {person.name}
                    </Link>
                  </TableCell>
                  <TableCell>{person.country.name}</TableCell>
                  <TableCell>
                    {person.wcaId && (
                      <Link
                        href={wcaUrl(`/persons/${person.wcaId}`)}
                        target="_blank"
                        underline="hover"
                      >
                        {person.wcaId}
                      </Link>
                    )}
                  </TableCell>
                  {competitionEvents.map((competitionEvent) => {
                    const result = competitionEvent.rounds[0].results.find(
                      (result) => result.person.id === person.id
                    );
                    return (
                      <TableCell
                        key={competitionEvent.id}
                        align="center"
                        sx={{
                          opacity:
                            result && result.attempts.length === 0 ? 0.5 : 1.0,
                        }}
                        padding="none"
                      >
                        {result && (
                          <Tooltip
                            title={
                              result.attempts.length > 0
                                ? "Competed"
                                : "Awaiting result"
                            }
                            placement="top"
                          >
                            <span>
                              <CubingIcon
                                eventId={competitionEvent.event.id}
                                small={true}
                              />
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    );
  }
);

AdminCompetitorsTable.displayName = "AdminCompetitorsTable";

export default AdminCompetitorsTable;
