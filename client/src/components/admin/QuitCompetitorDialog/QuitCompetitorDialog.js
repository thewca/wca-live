import React, { useState, Fragment } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import { RESULTS_UPDATE_FRAGMENT } from '../../../lib/graphql-fragments';

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
          ranking
          advancing
          attempts {
            result
          }
          best
          average
          person {
            id
            registrantId
            name
          }
          singleRecordTag
          averageRecordTag
        }
      }
    }
  }
`;

const QuitCompetitorDialog = ({
  open,
  onClose,
  competitor,
  competitionId,
  roundId,
}) => {
  const [replace, setReplace] = useState('');
  const { data, loading, error } = useQuery(NEXT_QUALIFYING_QUERY, {
    variables: { roundId },
  });
  const [
    removePersonFromRound,
    { loading: quitLoading, error: quitError },
  ] = useMutation(REMOVE_PERSON_FROM_ROUND_MUTATION, {
    variables: {
      input: {
        roundId,
        personId: competitor.id,
        replace: replace === 'true',
      },
    },
    onCompleted: onClose,
  });
  if (error) return <ErrorSnackbar />;

  return (
    <Dialog open={open} onClose={onClose}>
      {loading && <Loading />}
      <DialogTitle>Quit {competitor.name}</DialogTitle>
      <DialogContent>
        {data && (
          <Fragment>
            <DialogContentText>
              Going to permanently remove {competitor.name} from this round. Are
              you sure you want to proceed?
            </DialogContentText>
            <RadioGroup
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
            >
              {data.round.nextQualifying.length > 0 && (
                <FormControlLabel
                  control={<Radio />}
                  value="true"
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
                value="false"
                label={
                  data.round.nextQualifying.length > 0
                    ? `Yes, just remove ${competitor.name} and don't replace them.`
                    : `Yes, remove ${competitor.name}.`
                }
              />
            </RadioGroup>
          </Fragment>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={removePersonFromRound}
          color="primary"
          disabled={replace === '' || quitLoading}
        >
          Confirm
        </Button>
        {quitError && <ErrorSnackbar error={quitError} />}
      </DialogActions>
    </Dialog>
  );
};

export default QuitCompetitorDialog;
