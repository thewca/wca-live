import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CustomQuery from '../CustomQuery/CustomQuery';
import RoundResults from '../RoundResults/RoundResults';

const PODIUMS_QUERY = gql`
  query Podiums($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      podiums {
        _id
        id
        event {
          _id
          id
          name
        }
        format {
          solveCount
          sortBy
        }
        results {
          _id
          ranking
          advancable
          attempts
          best
          average
          person {
            _id
            id
            name
            country {
              name
            }
          }
          recordTags {
            single
            average
          }
        }
      }
    }
  }
`;

const Podiums = ({ match }) => {
  const { competitionId } = match.params;

  return (
    <CustomQuery query={PODIUMS_QUERY} variables={{ competitionId }}>
      {({
        data: {
          competition: { podiums },
        },
      }) => {
        return (
          <Fragment>
            <Typography variant="h5" gutterBottom>
              Podiums
            </Typography>
            {podiums.length > 0 ? (
              <Grid container direction="column" spacing={2}>
                {podiums.map(round => (
                  <Grid item key={round.id}>
                    <Typography variant="subtitle1">
                      {round.event.name}
                    </Typography>
                    <RoundResults
                      results={round.results}
                      format={round.format}
                      eventId={round.event.id}
                      competitionId={competitionId}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>{`There are no podiums yet!`}</Typography>
            )}
          </Fragment>
        );
      }}
    </CustomQuery>
  );
};

export default Podiums;
