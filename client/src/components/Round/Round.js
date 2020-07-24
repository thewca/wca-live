import React, { Fragment, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Switch, Route, Redirect, Link, useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TvIcon from '@material-ui/icons/Tv';
import PrintIcon from '@material-ui/icons/Print';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import ResultsProjector from '../ResultsProjector/ResultsProjector';
import RoundResults from '../RoundResults/RoundResults';

const ROUND_RESULT_FRAGMENT = gql`
  fragment roundResult on Result {
    ranking
    advancing
    attempts {
      result
    }
    best
    average
    person {
      id
      name
      country {
        iso2
        name
      }
    }
    singleRecordTag
    averageRecordTag
  }
`;

const ROUND_QUERY = gql`
  query Round($id: ID!) {
    round(id: $id) {
      id
      name
      finished
      active
      competitionEvent {
        id
        event {
          id
          name
        }
      }
      format {
        numberOfAttempts
        sortBy
      }
      results {
        id
        ...roundResult
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

const ROUND_UPDATED_SUBSCRIPTION = gql`
  subscription RoundUpdated($id: ID!) {
    roundUpdated(id: $id) {
      id
      results {
        id
        ...roundResult
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

const Round = () => {
  const { competitionId, roundId } = useParams();
  const { data, loading, error, subscribeToMore } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });

  const shouldSubscribe =
    data && data.round && (!data.round.finished || data.round.active);
  useEffect(() => {
    if (shouldSubscribe) {
      const unsubscribe = subscribeToMore({
        document: ROUND_UPDATED_SUBSCRIPTION,
        variables: { id: roundId },
      });
      return unsubscribe;
    }
  }, [subscribeToMore, roundId, shouldSubscribe]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { round } = data;

  return (
    <Fragment>
      {loading && <Loading />}
      <Grid container alignItems="center">
        <Grid item>
          <Typography variant="h5">
            {round.competitionEvent.event.name} - {round.name}
          </Typography>
        </Grid>
        <Grid item style={{ flexGrow: 1 }} />
        <Hidden smDown>
          <Grid item>
            <Tooltip title="PDF" placement="top">
              <IconButton
                component="a"
                target="_blank"
                href={`/pdfs/rounds/${roundId}`}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Projector view" placement="top">
              <IconButton
                component={Link}
                to={`/competitions/${competitionId}/rounds/${roundId}/projector`}
              >
                <TvIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Hidden>
      </Grid>
      <Switch>
        <Route
          exact
          path={`/competitions/${competitionId}/rounds/${roundId}/projector`}
          render={() => (
            <ResultsProjector
              results={round.results}
              format={round.format}
              eventId={round.competitionEvent.event.id}
              title={`${round.competitionEvent.event.name} - ${round.name}`}
              exitUrl={`/competitions/${competitionId}/rounds/${roundId}`}
              competitionId={competitionId}
            />
          )}
        />
        <Route
          exact
          path={`/competitions/${competitionId}/rounds/${roundId}`}
          render={() => (
            <RoundResults
              results={round.results}
              format={round.format}
              eventId={round.competitionEvent.event.id}
              competitionId={competitionId}
            />
          )}
        />
        <Redirect to={`/competitions/${competitionId}/rounds/${roundId}`} />
      </Switch>
    </Fragment>
  );
};

export default Round;
