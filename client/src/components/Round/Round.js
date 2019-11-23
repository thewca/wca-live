import React, { useState, Fragment } from 'react';
import gql from 'graphql-tag';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TvIcon from '@material-ui/icons/Tv';
import PrintIcon from '@material-ui/icons/Print';

import CustomQuery from '../CustomQuery/CustomQuery';
import ResultsProjector from '../ResultsProjector/ResultsProjector';
import RoundResults from '../RoundResults/RoundResults';
import { RESULTS_UPDATE_FRAGMENT } from '../../logic/graphql-fragments';

const ROUND_QUERY = gql`
  query Round($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
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
      results {
        ranking
        advancable
        attempts
        best
        average
        person {
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
  subscription RoundUpdate($competitionId: ID!, $roundId: ID!) {
    roundUpdate(competitionId: $competitionId, roundId: $roundId) {
      id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
`;

const Round = ({ match }) => {
  const { competitionId, roundId } = match.params;
  const [subscribed, setSubscribed] = useState(false);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round }, subscribeToMore }) => {
        if (!subscribed) {
          subscribeToMore({
            document: ROUND_UPDATE_SUBSCRIPTION,
            variables: { competitionId, roundId },
          });
          setSubscribed(true);
        }

        return (
          <Fragment>
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
                      href={`/pdfs/competitions/${competitionId}/rounds/${round.id}`}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Projector view" placement="top">
                    <IconButton
                      component={Link}
                      to={`/competitions/${competitionId}/rounds/${round.id}/projector`}
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
                path={`/competitions/${competitionId}/rounds/${round.id}/projector`}
                render={() => (
                  <ResultsProjector
                    results={round.results}
                    format={round.format}
                    eventId={round.event.id}
                    title={`${round.event.name} - ${round.name}`}
                    exitUrl={`/competitions/${competitionId}/rounds/${round.id}`}
                    competitionId={competitionId}
                  />
                )}
              />
              <Route
                exact
                path={`/competitions/${competitionId}/rounds/${round.id}`}
                render={() => (
                  <RoundResults
                    results={round.results}
                    format={round.format}
                    eventId={round.event.id}
                    competitionId={competitionId}
                  />
                )}
              />
              <Redirect
                to={`/competitions/${competitionId}/rounds/${round.id}`}
              />
            </Switch>
          </Fragment>
        );
      }}
    </CustomQuery>
  );
};

export default Round;
