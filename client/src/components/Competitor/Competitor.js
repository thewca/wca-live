import React, { useState } from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import wcaLogo from '../Home/logo.svg';
import CustomQuery from '../CustomQuery/CustomQuery';
import FlagIcon from '../FlagIcon/FlagIcon';
import CompetitorResultsTable from '../CompetitorResultsTable/CompetitorResultsTable';
import CompetitorResultDialog from '../CompetitorResultDialog/CompetitorResultDialog';
import { groupBy } from '../../logic/utils';
import { wcaUrl } from '../../logic/url-utils';

const COMPETITOR_QUERY = gql`
  query Competitor($competitionId: ID!, $competitorId: ID!) {
    competitor(competitionId: $competitionId, competitorId: $competitorId) {
      id
      name
      wcaId
      country {
        iso2
      }
      results {
        ranking
        advancable
        attempts
        best
        average
        recordTags {
          single
          average
        }
        round {
          id
          name
          event {
            id
            name
          }
          format {
            solveCount
            sortBy
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  competitor: {
    marginBottom: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
}));

const Competitor = ({ match }) => {
  const classes = useStyles();
  const { competitionId, competitorId } = match.params;
  const [selectedResult, setSelectedResult] = useState(null);

  return (
    <CustomQuery
      query={COMPETITOR_QUERY}
      variables={{ competitionId, competitorId }}
    >
      {({ data }) => {
        const { competitor } = data;
        const resultsByEvent = groupBy(
          competitor.results,
          result => result.round.event.name
        );
        return (
          <div>
            <Grid
              container
              alignContent="center"
              className={classes.competitor}
            >
              <Grid item>
                <Typography variant="h5">
                  {competitor.name}{' '}
                  <FlagIcon code={competitor.country.iso2.toLowerCase()} />
                </Typography>
              </Grid>
              <Grid item className={classes.grow} />
              {competitor.wcaId && (
                <Grid item>
                  <a
                    href={wcaUrl(`/persons/${competitor.wcaId}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={wcaLogo}
                      alt="WCA Profile"
                      height="32"
                      width="32"
                    />
                  </a>
                </Grid>
              )}
            </Grid>
            <Grid container direction="column" spacing={2}>
              {Object.entries(resultsByEvent).map(([eventName, results]) => (
                <Grid item key={eventName}>
                  <Typography variant="subtitle1">{eventName}</Typography>
                  <CompetitorResultsTable
                    results={results}
                    competitionId={competitionId}
                    onResultClick={result => setSelectedResult(result)}
                  />
                </Grid>
              ))}
            </Grid>
            <Hidden smUp>
              <CompetitorResultDialog
                result={selectedResult}
                competitionId={competitionId}
                onClose={() => setSelectedResult(null)}
              />
            </Hidden>
          </div>
        );
      }}
    </CustomQuery>
  );
};

export default Competitor;
