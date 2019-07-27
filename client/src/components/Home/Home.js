import React from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import logo from './logo.svg';
import CustomQuery from '../CustomQuery/CustomQuery';
import CompetitionList from '../CompetitionList/CompetitionList';

const COMPETITIONS_QUERY = gql`
  query Competitions {
    competitions {
      upcoming {
        ...competitionInfo
      }
      inProgress {
        ...competitionInfo
      }
      past {
        ...competitionInfo
      }
    }
  }

  fragment competitionInfo on Competition {
    id
    name
    startDate
    endDate
  }
`;

const Home = () => {
  return (
    <CustomQuery query={COMPETITIONS_QUERY}>
      {({
        data: {
          competitions: { upcoming, inProgress, past },
        },
      }) => (
        <div style={{ padding: 24 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <img src={logo} height="128" width="128" />
              <Typography variant="h4">WCA Live</Typography>
              <Typography variant="subtitle1">
                Live results from competitions all around the world!
              </Typography>
            </Grid>
            {inProgress.length > 0 && (
              <Grid item xs={12}>
                <Paper>
                  <CompetitionList
                    title="Happening right now!"
                    competitions={inProgress}
                  />
                </Paper>
              </Grid>
            )}
            {upcoming.length > 0 && (
              <Grid item xs={12}>
                <Paper>
                  <CompetitionList title="Upcoming" competitions={upcoming} />
                </Paper>
              </Grid>
            )}
            {past.length > 0 && (
              <Grid item xs={12}>
                <Paper>
                  <CompetitionList title="Past" competitions={past} />
                </Paper>
              </Grid>
            )}
          </Grid>
        </div>
      )}
    </CustomQuery>
  );
};

export default Home;
