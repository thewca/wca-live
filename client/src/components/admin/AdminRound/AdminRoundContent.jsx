import { useState, useCallback, useEffect, useRef } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  TableContainer,
  Tooltip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import ResultAttemptsForm from "../ResultAttemptsForm/ResultAttemptsForm";
import AdminResultsTable from "./AdminResultsTable";
import ResultMenu from "./ResultMenu";
import AdminRoundToolbar from "./AdminRoundToolbar";
import { ADMIN_ROUND_RESULT_FRAGMENT } from "./fragments";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";
import QuitCompetitorDialog from "./QuitCompetitorDialog";
import { nowISOString } from "../../../lib/date";

const ENTER_RESULTS = gql`
  mutation EnterResults($input: EnterResultsInput!) {
    enterResults(input: $input) {
      round {
        id
        number
        results {
          id
          ...adminRoundResult
        }
      }
    }
  }
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

const IS_BATCH_MODE_KEY = `wca-live:is-batch-mode`;
/**
 * Persist whether batch mode is toggled on, in case people navigate
 * or refresh the page
 */
function getStoreIsBatchMode() {
  return localStorage.getItem(IS_BATCH_MODE_KEY);
}

function setStoreIsBatchMode(isBatchMode) {
  localStorage.setItem(IS_BATCH_MODE_KEY, isBatchMode);
}

/**
 * Persist batch results in local storage, in case people navigate
 * or refresh the page
 */

function getStoreBatchResults(roundId) {
  const json = localStorage.getItem(`wca-live:batch-results:${roundId}`);
  return json ? JSON.parse(json) : [];
}

function setStoredBatchResults(roundId, results) {
  if (results.length > 0) {
    localStorage.setItem(
      `wca-live:batch-results:${roundId}`,
      JSON.stringify(results),
    );
  } else {
    localStorage.removeItem(`wca-live:batch-results:${roundId}`);
  }
}

function AdminRoundContent({ round, competitionId, officialWorldRecords }) {
  const confirm = useConfirm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const apolloErrorHandler = useApolloErrorHandler();

  const [editedResult, setEditedResult] = useState(null);
  const [resultMenuProps, updateResultMenuProps] = useState({});
  const [competitorToQuit, setCompetitorToQuit] = useState(null);

  const [batchResults, setBatchResults] = useState(() =>
    getStoreBatchResults(round.id),
  );
  const [isBatchMode, setIsBatchMode] = useState(
    batchResults.length > 0 || getStoreIsBatchMode(),
  );
  const formContainerRef = useRef(null);

  const [enterResults, { loading }] = useMutation(ENTER_RESULTS, {
    onCompleted: () => {
      setEditedResult(null);

      if (isBatchMode) {
        setBatchResults([]);
        formContainerRef.current.querySelector("input").focus();
      }
    },
    onError: apolloErrorHandler,
  });

  function handleResultAttemptsSubmit(attempts) {
    if (isBatchMode) {
      setBatchResults([
        ...batchResults.filter((result) => result.id !== editedResult.id),
        { id: editedResult.id, attempts, enteredAt: nowISOString() },
      ]);
      setEditedResult(null);
    } else {
      enterResults({
        variables: {
          input: {
            id: round.id,
            results: [
              { id: editedResult.id, attempts, enteredAt: nowISOString() },
            ],
          },
        },
      });
    }
  }

  function handleResultsBatchSubmit() {
    enterResults({
      variables: {
        input: { id: round.id, results: batchResults },
      },
    });
  }

  function discardBatch() {
    confirm({
      description: `This will discard all entered results that are currently in the batch.`,
    }).then(() => {
      setBatchResults([]);
    });
  }

  function handleClearResult(result) {
    confirm({
      description: `This will clear all attempts of ${result.person.name}.`,
    }).then(() => {
      enterResults({
        variables: {
          input: {
            id: round.id,
            results: [
              { id: result.id, attempts: [], enteredAt: nowISOString() },
            ],
          },
        },
      });
    });
  }

  const handleResultClick = useCallback((result, event) => {
    updateResultMenuProps({
      position: { left: event.clientX, top: event.clientY },
      result,
    });
  }, []);

  const next = round.competitionEvent.rounds.find(
    (other) => other.number === round.number + 1,
  );
  const nextOpen = next && next.open;

  useEffect(() => {
    if (nextOpen) {
      const snackbarId = enqueueSnackbar(
        "The next round has already been open, any changes won't affect it!",
        { variant: "info" },
      );

      return () => closeSnackbar(snackbarId);
    }
  }, [nextOpen, enqueueSnackbar, closeSnackbar]);

  useEffect(() => {
    setStoredBatchResults(round.id, batchResults);
  }, [round.id, batchResults]);

  return (
    <>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={3} ref={formContainerRef}>
          <ResultAttemptsForm
            result={editedResult}
            results={round.results}
            onResultChange={setEditedResult}
            eventId={round.competitionEvent.event.id}
            format={round.format}
            timeLimit={round.timeLimit}
            cutoff={round.cutoff}
            focusOnResultChange={true}
            disabled={loading}
            onSubmit={handleResultAttemptsSubmit}
            officialWorldRecords={officialWorldRecords}
          />
          <Box sx={{ mt: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isBatchMode}
                  onChange={(event) => {
                    setIsBatchMode(event.target.checked);
                    setStoreIsBatchMode(event.target.checked);
                  }}
                  disabled={batchResults.length > 0}
                />
              }
              label="Batch mode"
            />
            {isBatchMode && (
              <Grid container direction="row" alignItems="center" gap={1}>
                <Grid item>
                  <Typography>
                    Results in batch: {batchResults.length}
                  </Typography>
                </Grid>
                <Grid item flexGrow={1}></Grid>
                <Grid item>
                  <Tooltip title="Discard batch" placement="top">
                    <IconButton
                      onClick={discardBatch}
                      size="small"
                      disabled={batchResults.length === 0}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    size="small"
                    disabled={batchResults.length === 0 || loading}
                    onClick={handleResultsBatchSubmit}
                  >
                    Submit batch
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={9} container direction="column" spacing={1}>
          <Grid item>
            <AdminRoundToolbar round={round} competitionId={competitionId} />
          </Grid>
          <Grid item sx={{ maxWidth: "100%" }}>
            <TableContainer
              component={Paper}
              sx={{ pr: 0.5 /* A bit of space for record tags. */ }}
            >
              <AdminResultsTable
                results={round.results}
                format={round.format}
                eventId={round.competitionEvent.event.id}
                onResultClick={handleResultClick}
              />
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
      <ResultMenu
        {...resultMenuProps}
        onClose={() => updateResultMenuProps({})}
        onEditClick={(result) => setEditedResult(result)}
        onQuitClick={(result) => setCompetitorToQuit(result.person)}
        onClearClick={handleClearResult}
        competitionId={competitionId}
      />
      <QuitCompetitorDialog
        open={Boolean(competitorToQuit)}
        onClose={() => setCompetitorToQuit(null)}
        competitor={competitorToQuit}
        roundId={round.id}
      />
    </>
  );
}

export default AdminRoundContent;
