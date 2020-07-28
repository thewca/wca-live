import React, { useState, useCallback, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Grid, Paper, TableContainer } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import ResultAttemptsForm from '../ResultAttemptsForm/ResultAttemptsForm';
import AdminResultsTable from './AdminResultsTable';
import ResultMenu from './ResultMenu';
import AdminRoundToolbar from './AdminRoundToolbar';
import { ADMIN_ROUND_RESULT_FRAGMENT } from './fragments';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';
import QuitCompetitorDialog from './QuitCompetitorDialog';

const ENTER_RESULT_ATTEMPTS = gql`
  mutation EnterResultAttempts($input: EnterResultAttemptsInput!) {
    enterResultAttempts(input: $input) {
      result {
        id
        round {
          id
          results {
            id
            ...roundResult
          }
        }
      }
    }
  }
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

const useStyles = makeStyles((theme) => ({
  tableGridItem: {
    maxWidth: '100%',
  },
  tableContainer: {
    paddingRight: 4, // A bit of space for record tags.
  },
}));

function AdminRoundContent({ round, competitionId }) {
  const classes = useStyles();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const apolloErrorHandler = useApolloErrorHandler();

  const [editedResult, setEditedResult] = useState(null);
  const [resultMenuProps, updateResultMenuProps] = useState({});
  const [competitorToQuit, setCompetitorToQuit] = useState(null);

  const [enterResultAttempts, { loading }] = useMutation(
    ENTER_RESULT_ATTEMPTS,
    {
      onCompleted: () => {
        setEditedResult(null);
      },
      onError: apolloErrorHandler,
    }
  );

  function handleResultAttemptsSubmit(attempts) {
    enterResultAttempts({
      variables: { input: { id: editedResult.id, attempts } },
    });
  }

  function handleClearResult(result) {
    confirm({
      description: `This will clear all attempts of ${result.person.name}.`,
    }).then(() => {
      enterResultAttempts({
        variables: { input: { id: result.id, attempts: [] } },
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
      enqueueSnackbar(
        "The next round has already been open, any changes won't affect it!",
        { variant: 'info' }
      );
    }
  }, [nextOpen, enqueueSnackbar]);

  return (
    <>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={3}>
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
        </Grid>
        <Grid item xs={12} md={9} container direction="column" spacing={1}>
          <Grid item>
            <AdminRoundToolbar round={round} competitionId={competitionId} />
          </Grid>
          <Grid item className={classes.tableGridItem}>
            <TableContainer
              component={Paper}
              className={classes.tableContainer}
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
