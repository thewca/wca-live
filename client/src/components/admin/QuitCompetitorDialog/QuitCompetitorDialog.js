import React, { useState, Fragment } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
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
import { RESULTS_UPDATE_FRAGMENT } from '../../../logic/graphql-fragments';

const NEXT_QUALIFYING_QUERY = gql`
  query NextQualifying($competitionId: ID!, $roundId: String!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      _id
      id
      nextQualifying {
        _id
        id
        name
      }
    }
  }
`;

const QUIT_COMPETITOR_MUTATION = gql`
  mutation QuitCompetitor(
    $competitionId: ID!
    $roundId: String!
    $competitorId: Int!
    $replace: Boolean!
  ) {
    quitCompetitor(
      competitionId: $competitionId
      roundId: $roundId
      competitorId: $competitorId
      replace: $replace
    ) {
      _id
      ...resultsUpdate
    }
  }
  ${RESULTS_UPDATE_FRAGMENT}
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
    variables: { competitionId, roundId },
  });
  const [quit, { loading: quitLoading, error: quitError }] = useMutation(
    QUIT_COMPETITOR_MUTATION,
    {
      variables: {
        competitionId,
        roundId,
        competitorId: competitor.id,
        replace: replace === 'true',
      },
      onCompleted: onClose,
    }
  );
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
              onChange={event => setReplace(event.target.value)}
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
          onClick={quit}
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
