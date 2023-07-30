import { gql, useQuery } from '@apollo/client';
import { Box, Grid, Paper } from '@mui/material';
import Error from '../Error/Error';
import HomeFooter from './HomeFooter';
import HomeCompetitions from './HomeCompetitions';
import HomeToolbar from './HomeToolbar';
import Loading from '../Loading/Loading';
import RecordList from '../RecordList/RecordList';
import { isUpcoming, isInProgress, isPast } from '../../lib/competition';
import { orderBy } from '../../lib/utils';
import { monthAgoDateString } from '../../lib/date';

const COMPETITIONS_QUERY = gql`
  query Competitions($from: Date!) {
    competitions(from: $from) {
      id
      name
      startDate
      endDate
      startTime
      endTime
      venues {
        id
        country {
          iso2
        }
      }
    }
    recentRecords {
      id
      tag
      type
      attemptResult
      result {
        id
        person {
          id
          name
          country {
            iso2
            name
          }
        }
        round {
          id
          competitionEvent {
            id
            event {
              id
              name
            }
            competition {
              id
            }
          }
        }
      }
    }
  }
`;

function Home() {
  const { data, loading, error } = useQuery(COMPETITIONS_QUERY, {
    variables: { from: monthAgoDateString() },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { recentRecords } = data;

  const competitions = orderBy(data.competitions, [
    (competition) => competition.startTime,
    (competition) => competition.endTime,
  ]);

  const upcoming = competitions.filter(isUpcoming);
  const inProgress = competitions.filter(isInProgress);
  const past = competitions.filter(isPast).reverse();

  return (
    <Box
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 1, md: 3 },
        display: 'flex',
        minHeight: '100%',
      }}
    >
      <Grid container spacing={2} direction="column" sx={{ flexGrow: 1 }}>
        <Grid item>
          <HomeToolbar
            upcoming={upcoming}
            inProgress={inProgress}
            past={past}
          />
        </Grid>
        <Grid item>
          <Paper>
            <HomeCompetitions
              upcoming={upcoming}
              inProgress={inProgress}
              past={past}
            />
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <RecordList title="Recent records" records={recentRecords} />
          </Paper>
        </Grid>
        <Grid item sx={{ flexGrow: 1 }} />
        <Grid item sx={{ width: '100%' }}>
          <HomeFooter />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
