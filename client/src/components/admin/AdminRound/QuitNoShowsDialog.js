import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';
import { orderBy, toggleElement } from '../../../lib/utils';

const REMOVE_NO_SHOWS_FROM_ROUND_MUTATION = gql`
  mutation RemoveNoShowsFromRound($input: RemoveNoShowsFromRoundInput!) {
    removeNoShowsFromRound(input: $input) {
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

function QuitNoShowsDialog({ open, onClose, roundId, results }) {
  const apolloErrorHandler = useApolloErrorHandler();

  const [selectedPersonIds, setSelectedPersonIds] = useState([]);

  const [removeNoShowsFromRound, { loading: mutationLoading }] = useMutation(
    REMOVE_NO_SHOWS_FROM_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personIds: selectedPersonIds,
        },
      },
      onCompleted: handleClose,
      onError: apolloErrorHandler,
    }
  );

  const noShowResults = orderBy(
    results.filter((result) => result.attempts.length === 0),
    (result) => result.person.name
  );

  function onResultClick(result) {
    setSelectedPersonIds(toggleElement(selectedPersonIds, result.person.id));
  }

  function handleClose() {
    setSelectedPersonIds([]);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Quit no-shows</DialogTitle>
      <DialogContent>
        {noShowResults.length > 0 ? (
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <DialogContentText>
                Here you can quickly select and quit competitors that did not
                show up.
              </DialogContentText>
            </Grid>
            <Grid item>
              <List
                dense
                sx={{
                  overflowY: 'auto',
                  maxHeight: 600,
                }}
              >
                {noShowResults.map((result) => (
                  <ListItem key={result.id}>
                    <ListItemButton dense onClick={() => onResultClick(result)}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedPersonIds.includes(result.person.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${result.person.name} (${result.person.registrantId})`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Typography variant="caption">
                {selectedPersonIds.length} of {noShowResults.length} selected
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <DialogContentText>{`All results are entered.`}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => removeNoShowsFromRound()}
          color="primary"
          disabled={selectedPersonIds.length === 0 || mutationLoading}
        >
          Quit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuitNoShowsDialog;
