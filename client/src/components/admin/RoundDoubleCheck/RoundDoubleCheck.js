import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import ResultForm from '../ResultForm/ResultForm';
import { sortBy } from '../../../lib/utils';
import { parseISO } from 'date-fns';

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
  const { competitionId, roundId } = useParams();
  const [resultIndex, updateResultIndex] = useState(0);
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  useEffect(() => {
    function handleKeyPress(event) {
      if (event.target.tagName.toUpperCase() === 'INPUT') return;
      if (event.key === 'ArrowLeft') {
        leftButtonRef.current.click();
      } else if (event.key === 'ArrowRight') {
        rightButtonRef.current.click();
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const { data, loading, error } = useQuery(ROUND_QUERY, {
    variables: { id: roundId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { round } = data;
  const results = sortBy(
    round.results,
    (result) => -parseISO(result.enteredAt)
  );

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
        <ResultForm
          result={results[resultIndex]}
          results={round.results}
          format={round.format}
          eventId={round.competitionEvent.event.id}
          timeLimit={round.timeLimit}
          cutoff={round.cutoff}
          competitionId={competitionId}
          roundId={roundId}
          updateResultMutation={ENTER_RESULT_ATTEMPTS}
          onResultChange={(result) => {
            /* Disable clearing as we don't want to lose track of the currently viewed result. */
            if (result !== null) {
              updateResultIndex(results.indexOf(result));
            }
          }}
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
