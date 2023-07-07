import React, { useState, useCallback, useEffect, useRef } from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TableContainer,
  Typography,
} from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import ResultAttemptsForm from '../ResultAttemptsForm/ResultAttemptsForm';
import AdminResultsTable from './AdminResultsTable';
import ResultMenu from './ResultMenu';
import AdminRoundToolbar from './AdminRoundToolbar';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';
import QuitCompetitorDialog from './QuitCompetitorDialog';

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

function AdminRoundContent({ round, competitionId }) {
  const confirm = useConfirm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const apolloErrorHandler = useApolloErrorHandler();

  const [editedResult, setEditedResult] = useState(null);
  const [resultMenuProps, updateResultMenuProps] = useState({});
  const [competitorToQuit, setCompetitorToQuit] = useState(null);

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const formContainerRef = useRef(null);

  const [enterResults, { loading }] = useMutation(ENTER_RESULTS, {
    onCompleted: () => {
      setEditedResult(null);

      if (batchResults.length > 0) {
        setBatchResults([]);
        formContainerRef.current.querySelector('input').focus();
      }
    },
    onError: apolloErrorHandler,
  });

  function handleResultAttemptsSubmit(attempts) {
    if (isBatchMode) {
      setBatchResults([
        ...batchResults.filter((result) => result.id !== editedResult.id),
        { id: editedResult.id, attempts },
      ]);
      setEditedResult(null);
    } else {
      enterResults({
        variables: {
          input: { id: round.id, results: [{ id: editedResult.id, attempts }] },
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

  function handleClearResult(result) {
    confirm({
      description: `This will clear all attempts of ${result.person.name}.`,
    }).then(() => {
      enterResults({
        variables: {
          input: { id: round.id, results: [{ id: result.id, attempts: [] }] },
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
    (other) => other.number === round.number + 1
  );
  const nextOpen = next && next.open;

  useEffect(() => {
    if (nextOpen) {
      const snackbarId = enqueueSnackbar(
        "The next round has already been open, any changes won't affect it!",
        { variant: 'info' }
      );

      return () => closeSnackbar(snackbarId);
    }
  }, [nextOpen, enqueueSnackbar, closeSnackbar]);

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
          />
          <Box sx={{ mt: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isBatchMode}
                  onChange={(event) => setIsBatchMode(event.target.checked)}
                  disabled={batchResults.length > 0}
                />
              }
              label="Batch mode"
            />
            {isBatchMode && (
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <Typography>
                    Results in batch: {batchResults.length}
                  </Typography>
                </Grid>
                <Grid item flexGrow={1}></Grid>
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
          <Grid item sx={{ maxWidth: '100%' }}>
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
