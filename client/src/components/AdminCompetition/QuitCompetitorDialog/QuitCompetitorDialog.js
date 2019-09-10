import React, { useState, Fragment } from 'react';
import gql from 'graphql-tag';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';
import { RESULTS_UPDATE_FRAGMENT } from '../../../logic/graphql-fragments';

const NEXT_QUALIFYING_QUERY = gql`
  query NextQualifying($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      id
      nextQualifying {
        id
        name
      }
    }
  }
`;

const QUIT_COMPETITOR_MUTATION = gql`
  mutation QuitCompetitor(
    $competitionId: ID!
    $roundId: ID!
    $competitorId: ID!
    $replace: Boolean!
  ) {
    quitCompetitor(
      competitionId: $competitionId
      roundId: $roundId
      competitorId: $competitorId
      replace: $replace
    ) {
      id
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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Quit {competitor.name}</DialogTitle>
      <DialogContent>
        <CustomQuery
          query={NEXT_QUALIFYING_QUERY}
          variables={{ competitionId, roundId }}
        >
          {({
            data: {
              round: { nextQualifying },
            },
          }) => (
            <Fragment>
              <DialogContentText>
                Going to permanently remove {competitor.name} from this round.
                Are you sure you want to proceed?
              </DialogContentText>
              <RadioGroup
                value={replace}
                onChange={event => setReplace(event.target.value)}
              >
                {nextQualifying.length > 0 && (
                  <FormControlLabel
                    control={<Radio />}
                    value="true"
                    label={`
                      Yes, remove ${competitor.name}
                      and replace they with other qualifying competitors:
                      ${nextQualifying.map(({ name }) => name).join(', ')}.
                    `}
                  />
                )}
                <FormControlLabel
                  control={<Radio />}
                  value="false"
                  label={
                    nextQualifying.length > 0
                      ? `Yes, just remove ${competitor.name} and don't replace them.`
                      : `Yes, remove ${competitor.name}.`
                  }
                />
              </RadioGroup>
            </Fragment>
          )}
        </CustomQuery>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <CustomMutation
          mutation={QUIT_COMPETITOR_MUTATION}
          variables={{
            competitionId,
            roundId,
            competitorId: competitor.id,
            replace: replace === 'true',
          }}
          onCompleted={onClose}
        >
          {(quit, { loading }) => (
            <Button
              onClick={quit}
              color="primary"
              disabled={replace === '' || loading}
            >
              Confirm
            </Button>
          )}
        </CustomMutation>
      </DialogActions>
    </Dialog>
  );
};

export default QuitCompetitorDialog;
