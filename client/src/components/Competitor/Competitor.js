import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import wcaLogo from '../Home/logo.svg';
import FlagIcon from '../FlagIcon/FlagIcon';
import CompetitorResultsTable from '../CompetitorResultsTable/CompetitorResultsTable';
import CompetitorResultDialog from '../CompetitorResultDialog/CompetitorResultDialog';
import { groupBy, sortByArray } from '../../lib/utils';
import { wcaUrl } from '../../lib/urls';
import { useParams } from 'react-router-dom';

const COMPETITOR_QUERY = gql`
  query Competitor($id: ID!) {
    person(id: $id) {
      id
      name
      wcaId
      country {
        iso2
      }
      results {
        id
        ranking
        advancing
        attempts {
          result
        }
        best
        average
        singleRecordTag
        averageRecordTag
        round {
          id
          name
          number
          competitionEvent {
            id
            event {
              id
              name
              rank
            }
          }
          format {
            numberOfAttempts
            sortBy
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  competitor: {
    marginBottom: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
}));

function Competitor() {
  const classes = useStyles();
  const { competitionId, competitorId } = useParams();
  const [selectedResult, setSelectedResult] = useState(null);
  const { data, loading, error } = useQuery(COMPETITOR_QUERY, {
    variables: { id: competitorId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { person } = data;

  const nonemptyResults = person.results.filter(
    (result) => result.attempts.length > 0
  );
  const resultsByEventName = groupBy(
    sortByArray(nonemptyResults, (result) => [
      result.round.competitionEvent.event.rank,
      result.round.number,
    ]),
    (result) => result.round.competitionEvent.event.name
  );

  return (
    <div>
      <Grid container alignContent="center" className={classes.competitor}>
        <Grid item>
          <Typography variant="h5">
            {person.name} <FlagIcon code={person.country.iso2.toLowerCase()} />
          </Typography>
        </Grid>
        <Grid item className={classes.grow} />
        {person.wcaId && (
          <Grid item>
            <a
              href={wcaUrl(`/persons/${person.wcaId}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={wcaLogo} alt="WCA Profile" height="32" width="32" />
            </a>
          </Grid>
        )}
      </Grid>
      <Grid container direction="column" spacing={2}>
        {Object.entries(resultsByEventName).map(([eventName, results]) => (
          <Grid item key={eventName}>
            <Typography variant="subtitle1">{eventName}</Typography>
            <CompetitorResultsTable
              results={results}
              competitionId={competitionId}
              onResultClick={(result) => setSelectedResult(result)}
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
}

export default Competitor;
