import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import { ROUND_RESULT_FRAGMENT } from './fragments';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

const NEXT_QUALIFYING_QUERY = gql`
  query NextQualifying($roundId: ID!) {
    round(id: $roundId) {
      id
      nextQualifying {
        id
        name
      }
    }
  }
`;

const REMOVE_PERSON_FROM_ROUND_MUTATION = gql`
  mutation RemovePersonFromRound($input: RemovePersonFromRoundInput!) {
    removePersonFromRound(input: $input) {
      round {
        id
        results {
          id
          ...roundResult
        }
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

const QuitCompetitorDialog = ({ open, onClose, competitor, roundId }) => {
  const apolloErrorHandler = useApolloErrorHandler();

  const [replaceAnswer, setReplaceAnswer] = useState('');

  const { data, loading, error } = useQuery(NEXT_QUALIFYING_QUERY, {
    variables: { roundId },
  });

  const [removePersonFromRound, { loading: quitLoading }] = useMutation(
    REMOVE_PERSON_FROM_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personId: competitor.id,
          replace: replaceAnswer === 'yes',
        },
      },
      onCompleted: onClose,
      onError: apolloErrorHandler,
    }
  );

  return (
    <Dialog open={open} onClose={onClose}>
      {loading && <Loading />}
      <DialogTitle>Quit {competitor.name}</DialogTitle>
      <DialogContent>
        {error && <Error error={error} />}
        {data && (
          <>
            <DialogContentText>
              Going to permanently remove {competitor.name} from this round. Are
              you sure you want to proceed?
            </DialogContentText>
            <RadioGroup
              value={replaceAnswer}
              onChange={(event) => setReplaceAnswer(event.target.value)}
            >
              {data.round.nextQualifying.length > 0 && (
                <FormControlLabel
                  control={<Radio />}
                  value="yes"
                  label={`
                    Yes, remove ${competitor.name}
                    and replace they with other qualifying competitors:
                    ${data.round.nextQualifying
                      .map(({ name }) => name)
                      .join(', ')}.
                  `}
                />
              )}
              <FormControlLabel
                control={<Radio />}
                value="no"
                label={
                  data.round.nextQualifying.length > 0
                    ? `Yes, just remove ${competitor.name} and don't replace them.`
                    : `Yes, remove ${competitor.name}.`
                }
              />
            </RadioGroup>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={removePersonFromRound}
          color="primary"
          disabled={replaceAnswer === '' || quitLoading}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuitCompetitorDialog;
