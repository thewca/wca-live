import { gql, useQuery } from '@apollo/client';
import { Box, Grid, Paper } from '@mui/material';
import Loading from '../Loading/Loading';
import Error from '../Error/Error';
import StaffMembersCompetitionList from './StaffMembersCompetitionList';
import CompetitorsCompetitionList from './CompetitorsCompetitionList';
import ImportableCompetitions from '../ImportableCompetitions/ImportableCompetitions';
import { orderBy } from '../../lib/utils';

const COMPETITIONS_QUERY = gql`
  query Competitions {
    currentUser {
      id
      staffMembers {
        id
        roles
        competition {
          id
          name
          startDate
          endDate
          venues {
            id
            country {
              iso2
            }
          }
        }
      }
      competitors {
        id
        competition {
          id
          name
          startDate
          endDate
          venues {
            id
            country {
              iso2
            }
          }
        }
      }
    }
  }
`;

function sortByCompetitionDateDesc(list) {
  return orderBy(
    list,
    [(item) => item.competition.startDate, (item) => item.competition.endDate],
    ['desc', 'desc']
  );
}

function MyCompetitions() {
  const { data, loading, error } = useQuery(COMPETITIONS_QUERY);

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;

  const { staffMembers, competitors } = data.currentUser;

  const sortedCompetitors = sortByCompetitionDateDesc(competitors);
  const sortedStaffMembers = sortByCompetitionDateDesc(staffMembers);

  return (
    <Box p={3}>
      <Grid container direction="column" spacing={3}>
        {competitors.length > 0 && (
          <Grid item>
            <Paper>
              <CompetitorsCompetitionList
                title="Competitor at"
                competitors={sortedCompetitors}
              />
            </Paper>
          </Grid>
        )}
        {staffMembers.length > 0 && (
          <Grid item>
            <Paper>
              <StaffMembersCompetitionList
                title="Staff member at"
                staffMembers={sortedStaffMembers}
              />
            </Paper>
          </Grid>
        )}
        <Grid item>
          <ImportableCompetitions />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MyCompetitions;
