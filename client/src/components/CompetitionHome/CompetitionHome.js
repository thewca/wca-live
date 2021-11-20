import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardHeader,
  Grid,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import Loading from '../Loading/Loading';
import Error from '../Error/Error';
import Schedule from '../Schedule/Schedule';
import CubingIcon from '../CubingIcon/CubingIcon';
import { wcaUrl } from '../../lib/urls';
import { flatMap } from '../../lib/utils';
import { competitionCountries } from '../../lib/competition';
import { getTimezone } from '../../lib/date';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      wcaId
      name
      competitionEvents {
        id
        event {
          id
          name
        }
        rounds {
          id
          name
          active
          open
          number
        }
      }
      venues {
        id
        name
        country {
          iso2
          name
        }
        rooms {
          id
          name
          color
          activities {
            id
            activityCode
            name
            startTime
            endTime
          }
        }
      }
    }
  }
`;

function CompetitionHome() {
  const { competitionId } = useParams();
  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { competition } = data;

  const countries = competitionCountries(competition);

  const active = flatMap(competition.competitionEvents, (competitionEvent) =>
    competitionEvent.rounds
      .filter((round) => round.active)
      .map((round) => [competitionEvent, round])
  );

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom noWrap>
          Welcome to {competition.name}!
        </Typography>
        <Typography>
          {`This competition takes place in
            ${
              countries.length === 1 ? countries[0].name : 'multiple countries'
            }. Check out the `}
          <Link
            href={wcaUrl(`/competitions/${competition.wcaId}`)}
            target="_blank"
            underline="hover"
          >
            WCA website
          </Link>
          {` for more details on the competition.`}
        </Typography>
      </Grid>
      {active.length > 0 && (
        <Grid item sx={{ width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Active rounds
          </Typography>
          <Grid container spacing={1}>
            {active.map(([competitionEvent, round]) => (
              <Grid item key={round.id} xs={12} sm={6} lg={4}>
                <Card>
                  <CardActionArea
                    component={RouterLink}
                    to={`/competitions/${competition.id}/rounds/${round.id}`}
                  >
                    <CardHeader
                      avatar={
                        <CubingIcon eventId={competitionEvent.event.id} />
                      }
                      title={`${competitionEvent.event.name} - ${round.name}`}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
      <Grid item sx={{ width: '100%' }}>
        <Grid container alignContent="center">
          <Grid item>
            <Typography variant="h5">Schedule</Typography>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }} />
          <Grid item>
            <Tooltip
              title={`
              All the dates and times below are displayed in your local timezone: ${getTimezone()}
              `}
            >
              <NotificationImportantIcon color="action" />
            </Tooltip>
          </Grid>
        </Grid>
        <Schedule
          venues={competition.venues}
          competitionEvents={competition.competitionEvents}
          competitionId={competition.id}
        />
      </Grid>
    </Grid>
  );
}

export default CompetitionHome;
