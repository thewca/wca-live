import React, { useState, useEffect, useRef } from 'react';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

import CustomQuery from '../../CustomQuery/CustomQuery';
import ResultForm from '../ResultForm/ResultForm';
import { toInt } from '../../../logic/utils';

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

const RoundDoubleCheck = ({ match }) => {
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
          <div style={{ padding: 24 }}>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
              spacing={2}
            >
              <Grid item md={3} style={{ textAlign: 'center' }}>
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
                  format={round.format}
                  eventId={round.event.id}
                  timeLimit={round.timeLimit}
                  cutoff={round.cutoff}
                  competitionId={competitionId}
                  roundId={roundId}
                  setResultMutation={SET_RESULT_MUTATION}
                  onPersonIdChange={id => {
                    setResultIndex(
                      results.findIndex(
                        result => toInt(result.person.id) === id
                      )
                    );
                  }}
                />
              </Grid>
              <Grid item md={3} style={{ textAlign: 'center' }}>
                <IconButton
                  ref={rightButtonRef}
                  autoFocus
                  onClick={() => setResultIndex(resultIndex + 1)}
                  disabled={resultIndex === results.length - 1}
                >
                  <Icon>chevron_right</Icon>
                </IconButton>
              </Grid>
            </Grid>
          </div>
        );
      }}
    </CustomQuery>
  );
};

export default RoundDoubleCheck;
