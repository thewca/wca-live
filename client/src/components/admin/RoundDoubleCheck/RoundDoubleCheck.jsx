import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Loading from "../../Loading/Loading";
import Error from "../../Error/Error";
import ResultAttemptsForm from "../ResultAttemptsForm/ResultAttemptsForm";
import { orderBy } from "../../../lib/utils";
import { parseISO } from "date-fns";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";
import { nowISOString } from "../../../lib/date";

const ROUND_QUERY = gql`
  query Round($id: ID!) {
    round(id: $id) {
      id
      name
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
      }
      timeLimit {
        centiseconds
        cumulativeRoundWcifIds
      }
      cutoff {
        numberOfAttempts
        attemptResult
      }
      results {
        id
        attempts {
          result
        }
        person {
          id
          name
          registrantId
        }
        enteredAt
        enteredBy {
          id
          name
        }
      }
    }
    officialWorldRecords {
      event {
        id
      }
      type
      attemptResult
    }
  }
`;

const ENTER_RESULT_ATTEMPTS = gql`
  mutation EnterResults($input: EnterResultsInput!) {
    enterResults(input: $input) {
      round {
        id
        results {
          id
          attempts {
            result
          }
        }
      }
    }
  }
`;

function RoundDoubleCheck() {
  const apolloErrorHandler = useApolloErrorHandler();
  const { roundId } = useParams();
  const [resultIndex, updateResultIndex] = useState(0);
  const [scoretakerFilter, updateScoretakerFilter] = useState("");
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target.tagName.toUpperCase() === "INPUT") return;
      if (event.key === "ArrowLeft") {
        leftButtonRef.current.click();
      } else if (event.key === "ArrowRight") {
        rightButtonRef.current.click();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data, loading, error } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });

  const unfilteredResults = data?.round.results || [];
  const filteredResults = scoretakerFilter
    ? unfilteredResults.filter((result) => {
        return result.enteredBy?.id === scoretakerFilter;
      })
    : unfilteredResults;

  const [enterResults, { error: enterLoading }] = useMutation(
    ENTER_RESULT_ATTEMPTS,
    {
      onCompleted: () => {
        rightButtonRef.current.focus();
      },
      onError: apolloErrorHandler,
    },
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (resultIndex < filteredResults.length - 1) {
        updateResultIndex(resultIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (resultIndex > 0) {
        updateResultIndex(resultIndex - 1);
      }
    },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { round, officialWorldRecords } = data;

  const scoretakers = Object.values(
    round.results.reduce((acc, result) => {
      if (result.enteredBy) {
        acc[result.enteredBy.id] = result.enteredBy;
      }
      return acc;
    }, {}),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const results = orderBy(
    filteredResults,
    (result) => -parseISO(result.enteredAt),
  );

  function handleResultChange(result) {
    // Disable clearing as we don't want to lose track of the currently viewed result.
    if (result !== null) {
      updateResultIndex(results.indexOf(result));
    }
  }

  function handleResultAttemptsSubmit(attempts) {
    enterResults({
      variables: {
        input: {
          id: round.id,
          results: [
            {
              id: results[resultIndex].id,
              attempts,
              enteredAt: nowISOString(),
            },
          ],
        },
      },
    });
  }

  const progressPercentage = Math.round(
    ((resultIndex + 1) / results.length) * 100,
  );

  return (
    <>
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
      />
      <Typography variant="subtitle1" align="right">
        {resultIndex + 1} of {results.length}
      </Typography>
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        {...handlers}
      >
        <Grid item md sx={{ textAlign: "center" }}>
          <IconButton
            ref={leftButtonRef}
            onClick={() => updateResultIndex(resultIndex - 1)}
            disabled={resultIndex === 0}
            size="large"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Grid>
        <Grid item md={3}>
          {scoretakers.length > 1 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="scoretaker-filter-label">
                Filter Scoretaker
              </InputLabel>
              <Select
                labelId="scoretaker-filter-label"
                id="scoretaker-filter"
                value={scoretakerFilter}
                label="Filter Scoretaker"
                onChange={(event) => {
                  updateScoretakerFilter(event.target.value);
                  updateResultIndex(0);
                }}
              >
                <MenuItem value={""}>
                  <em>All</em>
                </MenuItem>
                {scoretakers.map((scoretaker) => (
                  <MenuItem key={scoretaker.id} value={scoretaker.id}>
                    {scoretaker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <ResultAttemptsForm
            result={results[resultIndex]}
            results={round.results}
            onResultChange={handleResultChange}
            eventId={round.competitionEvent.event.id}
            format={round.format}
            timeLimit={round.timeLimit}
            cutoff={round.cutoff}
            disabled={enterLoading}
            onSubmit={handleResultAttemptsSubmit}
            officialWorldRecords={officialWorldRecords}
          />
        </Grid>
        <Grid item md sx={{ textAlign: "center" }}>
          <IconButton
            ref={rightButtonRef}
            autoFocus
            onClick={() => updateResultIndex(resultIndex + 1)}
            disabled={resultIndex === results.length - 1}
            size="large"
          >
            <ChevronRightIcon />
          </IconButton>
        </Grid>
        <Grid item md={5}>
          <Typography variant="h5" align="center">
            {round.competitionEvent.event.name} - {round.name}
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Double-check
          </Typography>
          <Typography align="justify">
            {`Here you can iterate over results ordered by entry time (newest first).
              When doing double-check you can place a scorecard
              next to the form to quickly compare attempt results.
              For optimal experience make sure to always put entered/updated
              scorecard at the top of the pile.
              If multiple scoretakers are entering results from the same round,
              they should each have their own pile then you can filter the results
              by scoretaker when double-checking.`}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}

export default RoundDoubleCheck;
