import React, { Fragment, useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
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
import { RESULTS_UPDATE_FRAGMENT } from '../../logic/graphql-fragments';

const ROUND_QUERY = gql`
  query Round($competitionId: ID!, $roundId: String!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      _id
      id
      name
      finished
      active
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
            iso2
          }
        }
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const ROUND_UPDATE_SUBSCRIPTION = gql`
  subscription RoundUpdate($competitionId: ID!, $roundId: String!) {
    roundUpdate(competitionId: $competitionId, roundId: $roundId) {
      _id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
`;

const Round = ({ match }) => {
  const { competitionId, roundId } = match.params;
  const { data, loading, error, subscribeToMore } = useQuery(ROUND_QUERY, {
    variables: { competitionId, roundId },
  });

  const { id, finished, active } = data ? data.round : {};
  useEffect(() => {
    if (!id) return;
    if (!finished || active) {
      const unsubscribe = subscribeToMore({
        document: ROUND_UPDATE_SUBSCRIPTION,
        variables: { competitionId, roundId: id },
      });
      return unsubscribe;
    }
  }, [subscribeToMore, competitionId, id, finished, active]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { round } = data;

  return (
    <Fragment>
      {loading && <Loading />}
      <Grid container alignItems="center">
        <Grid item>
          <Typography variant="h5">
            {round.event.name} - {round.name}
          </Typography>
        </Grid>
        <Grid item style={{ flexGrow: 1 }} />
        <Hidden smDown>
          <Grid item>
            <Tooltip title="PDF" placement="top">
              <IconButton
                component="a"
                target="_blank"
                href={`/pdfs/competitions/${competitionId}/rounds/${roundId}`}
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
              eventId={round.event.id}
              title={`${round.event.name} - ${round.name}`}
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
              eventId={round.event.id}
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
