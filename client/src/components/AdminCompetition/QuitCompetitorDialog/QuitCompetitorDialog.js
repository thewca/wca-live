import React, { useState, Fragment } from 'react';
import gql from 'graphql-tag';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';

const NEXT_ADVANCABLE_QUERY = gql`
  query NextAdvancable($competitionId: ID!, $roundId: ID!) {
    nextAdvancable(competitionId: $competitionId, roundId: $roundId) {
      id
      name
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
      results {
        ranking
        person {
          id
          name
        }
        attempts
        advancable
        recordTags {
          single
          average
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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Quit {competitor.name}</DialogTitle>
      <DialogContent>
        <CustomQuery
          query={NEXT_ADVANCABLE_QUERY}
          variables={{ competitionId, roundId }}
          fetchPolicy="network-only"
        >
          {({ data: { nextAdvancable } }) => (
            <Fragment>
              <DialogContentText>
                Going to permanently remove {competitor.name} from this round.
                Are you sure you want to proceed?
              </DialogContentText>
              <RadioGroup
                value={replace}
                onChange={event => setReplace(event.target.value)}
              >
                {nextAdvancable.length > 0 && (
                  <FormControlLabel
                    control={<Radio />}
                    value="true"
                    label={`
                      Yes, remove ${competitor.name}
                      and replace him with other qualifying competitors:
                      ${nextAdvancable.map(({ name }) => name).join(', ')}.
                    `}
                  />
                )}
                <FormControlLabel
                  control={<Radio />}
                  value="false"
                  label={`Yes, just remove ${competitor.name} and don't replace they.`}
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
