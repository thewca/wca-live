import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { ADMIN_ROUND_RESULT_FRAGMENT } from "./fragments";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";
import ResultSelect from "../ResultAttemptsForm/ResultSelect";

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

  const [selectedResults, setSelectedResults] = useState([]);

  const [removeNoShowsFromRound, { loading: mutationLoading }] = useMutation(
    REMOVE_NO_SHOWS_FROM_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personIds: selectedResults.map((result) => result.person.id),
        },
      },
      onCompleted: handleClose,
      onError: apolloErrorHandler,
    }
  );

  const noShowResults = results.filter(
    (result) => result.attempts.length === 0
  );

  function onResultsChange(results) {
    setSelectedResults(results);
  }

  function handleClose() {
    setSelectedResults([]);
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
              <ResultSelect
                multiple
                results={noShowResults}
                value={selectedResults}
                onChange={(result) => onResultsChange(result)}
                TextFieldProps={{
                  autoFocus: true,
                  fullWidth: true,
                  variant: "outlined",
                }}
              />
              <Typography variant="caption">
                {selectedResults.length} of {noShowResults.length} selected
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
          disabled={selectedResults.length === 0 || mutationLoading}
        >
          Quit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuitNoShowsDialog;
