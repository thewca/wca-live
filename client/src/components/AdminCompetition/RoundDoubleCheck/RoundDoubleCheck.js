import React, { useState, useEffect, useRef } from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import CustomQuery from '../../CustomQuery/CustomQuery';
import ResultForm from '../ResultForm/ResultForm';

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
      }
      timeLimit {
        centiseconds
        cumulativeRoundIds
      }
      cutoff {
        numberOfAttempts
        attemptResult
      }
      results {
        attempts
        person {
          id
          name
        }
        updatedAt
      }
    }
  }
`;

const SET_RESULT_MUTATION = gql`
  mutation SetResult(
    $competitionId: ID!
    $roundId: ID!
    $result: ResultInput!
  ) {
    setResult(
      competitionId: $competitionId
      roundId: $roundId
      result: $result
    ) {
      id
      results {
        attempts
        person {
          id
          name
        }
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  centerContent: {
    textAlign: 'center',
  },
}));

const RoundDoubleCheck = ({ match }) => {
  const classes = useStyles();
  const { competitionId, roundId } = match.params;
  const [resultIndex, setResultIndex] = useState(0);
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = event => {
      if (event.target.tagName.toUpperCase() === 'INPUT') return;
      if (event.key === 'ArrowLeft') {
        leftButtonRef.current.click();
      } else if (event.key === 'ArrowRight') {
        rightButtonRef.current.click();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <CustomQuery query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data: { round } }) => {
        const results = round.results
          .slice()
          .sort((r1, r2) => new Date(r2.updatedAt) - new Date(r1.updatedAt));
        return (
          <Grid container direction="row" alignItems="center" spacing={2}>
            <Grid item md className={classes.centerContent}>
              <IconButton
                ref={leftButtonRef}
                onClick={() => setResultIndex(resultIndex - 1)}
                disabled={resultIndex === 0}
              >
                <Icon>chevron_left</Icon>
              </IconButton>
            </Grid>
            <Grid item md={3}>
              <ResultForm
                result={results[resultIndex]}
                results={round.results}
                format={round.format}
                eventId={round.event.id}
                timeLimit={round.timeLimit}
                cutoff={round.cutoff}
                competitionId={competitionId}
                roundId={roundId}
                setResultMutation={SET_RESULT_MUTATION}
                onResultChange={result => {
                  setResultIndex(results.indexOf(result));
                }}
              />
            </Grid>
            <Grid item md className={classes.centerContent}>
              <IconButton
                ref={rightButtonRef}
                autoFocus
                onClick={() => setResultIndex(resultIndex + 1)}
                disabled={resultIndex === results.length - 1}
              >
                <Icon>chevron_right</Icon>
              </IconButton>
            </Grid>
            <Grid item md={5}>
              <Typography variant="h5" align="center">
                {round.event.name} - {round.name}
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
      }}
    </CustomQuery>
  );
};

export default RoundDoubleCheck;
