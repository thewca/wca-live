import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import ResultsProjector from "../ResultsProjector/ResultsProjector";
import RoundResults from "../RoundResults/RoundResults";
import RoundToolbar from "./RoundToolbar";

const ROUND_RESULT_FRAGMENT = gql`
  fragment roundResult on Result {
    ranking
    advancing
    advancingQuestionable
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
        id
        numberOfAttempts
        sortBy
      }
      advancementCondition {
        level
        type
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

function Round() {
  const { competitionId, roundId } = useParams();

  const {
    data: newData,
    loading,
    error,
    subscribeToMore,
  } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });

  const [previousData, setPreviousData] = useState(null);
  const [forecastView, setForecastView] = useState(false);

  useEffect(() => {
    if (newData) setPreviousData(newData);
  }, [newData]);

  useEffect(() => {
    // Reset to default on round change
    setForecastView(false);
  }, [roundId]);

  // When the round changes, show the old data until the new is loaded.
  const data = newData || previousData;

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

  if (!data) return <Loading />;
  if (error) return <Error error={error} />;
  const { round } = data;

  return (
    <>
      {loading && <Loading />}
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <RoundToolbar
            round={round}
            competitionId={competitionId}
            forecastView={forecastView}
            setForecastView={setForecastView}
          />
        </Grid>
        <Grid item>
          <Routes>
            <Route
              path="projector"
              element={
                <ResultsProjector
                  results={round.results}
                  format={round.format}
                  eventId={round.competitionEvent.event.id}
                  title={`${round.competitionEvent.event.name} - ${round.name}`}
                  exitUrl={`/competitions/${competitionId}/rounds/${roundId}`}
                  forecastView={forecastView}
                />
              }
            />
            <Route
              path=""
              element={
                <RoundResults
                  // We use key to reset component state on round change
                  key={data.round.id}
                  results={round.results}
                  format={round.format}
                  eventId={round.competitionEvent.event.id}
                  competitionId={competitionId}
                  forecastView={forecastView}
                />
              }
            />
            <Route
              path="*"
              element={
                <Navigate
                  to={`/competitions/${competitionId}/rounds/${roundId}`}
                />
              }
            />
          </Routes>
        </Grid>
      </Grid>
    </>
  );
}

export default Round;
