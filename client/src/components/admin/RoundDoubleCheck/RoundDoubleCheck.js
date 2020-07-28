import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import ResultAttemptsForm from '../ResultAttemptsForm/ResultAttemptsForm';
import { sortBy } from '../../../lib/utils';
import { parseISO } from 'date-fns';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

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
      }
    }
  }
`;

const ENTER_RESULT_ATTEMPTS = gql`
  mutation EnterResultAttempts($input: EnterResultAttemptsInput!) {
    enterResultAttempts(input: $input) {
      result {
        id
        attempts {
          result
        }
        # enteredAt # TODO: updating the timestamp updates the order and that's kinda weird
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  centerContent: {
    textAlign: 'center',
  },
}));

function RoundDoubleCheck() {
  const classes = useStyles();
  const apolloErrorHandler = useApolloErrorHandler();
  const { roundId } = useParams();
  const [resultIndex, updateResultIndex] = useState(0);
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target.tagName.toUpperCase() === 'INPUT') return;
      if (event.key === 'ArrowLeft') {
        leftButtonRef.current.click();
      } else if (event.key === 'ArrowRight') {
        rightButtonRef.current.click();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data, loading, error } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });

  const [enterResultAttempts, { error: enterLoading }] = useMutation(
    ENTER_RESULT_ATTEMPTS,
    {
      onCompleted: () => {
        rightButtonRef.current.focus();
      },
      onError: apolloErrorHandler,
    }
  );

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { round } = data;

  const results = sortBy(
    round.results,
    (result) => -parseISO(result.enteredAt)
  );

  function handleResultChange(result) {
    // Disable clearing as we don't want to lose track of the currently viewed result.
    if (result !== null) {
      updateResultIndex(results.indexOf(result));
    }
  }

  function handleResultAttemptsSubmit(attempts) {
    enterResultAttempts({
      variables: { input: { id: results[resultIndex].id, attempts } },
    });
  }

  return (
    <Grid container direction="row" alignItems="center" spacing={2}>
      <Grid item md className={classes.centerContent}>
        <IconButton
          ref={leftButtonRef}
          onClick={() => updateResultIndex(resultIndex - 1)}
          disabled={resultIndex === 0}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Grid>
      <Grid item md={3}>
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
        />
      </Grid>
      <Grid item md className={classes.centerContent}>
        <IconButton
          ref={rightButtonRef}
          autoFocus
          onClick={() => updateResultIndex(resultIndex + 1)}
          disabled={resultIndex === results.length - 1}
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
            scorecard at the top of the pile.`}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default RoundDoubleCheck;
