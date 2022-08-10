import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
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
} from '@mui/material';
import Loading from '../../Loading/Loading';
import Error from '../../Error/Error';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';
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
          ...adminRoundResult
        }
      }
    }
  }
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

const QuitCompetitorDialog = ({ open, onClose, competitor, roundId }) => {
  const apolloErrorHandler = useApolloErrorHandler();

  const [replaceAnswer, setReplaceAnswer] = useState('');

  const [getNextQualifying, { data, loading, error }] = useLazyQuery(
    NEXT_QUALIFYING_QUERY,
    { variables: { roundId } }
  );

  useEffect(() => {
    if (open) {
      getNextQualifying();
      setReplaceAnswer('');
    }
  }, [open, getNextQualifying]);

  const [removePersonFromRound, { loading: quitLoading }] = useMutation(
    REMOVE_PERSON_FROM_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personId: competitor && competitor.id,
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
      <DialogTitle>
        Quit {competitor && competitor && competitor.name}
      </DialogTitle>
      <DialogContent>
        {error && <Error error={error} />}
        {data && (
          <>
            <DialogContentText>
              Going to permanently remove {competitor && competitor.name} from
              this round. Are you sure you want to proceed?
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
                    Yes, remove ${competitor && competitor.name}
                    and replace them with other qualifying competitors:
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
                    ? `Yes, just remove ${
                        competitor && competitor.name
                      } and don't replace them.`
                    : `Yes, remove ${competitor && competitor.name}.`
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
