import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Link as RouterLink } from 'react-router-dom';
import { ListSubheader, Menu, MenuItem } from '@material-ui/core';
import { useConfirm } from 'material-ui-confirm';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import QuitCompetitorDialog from './QuitCompetitorDialog';
import { ROUND_RESULT_FRAGMENT } from './fragments';

const CLEAR_RESULT_ATTEMPTS = gql`
  mutation ClearResultAttempts($id: ID!) {
    enterResultAttempts(input: { id: $id, attempts: [] }) {
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
  ${ROUND_RESULT_FRAGMENT}
`;

function ResultMenu({
  result,
  position,
  onClose,
  onEditClick,
  competitionId,
  roundId,
}) {
  const confirm = useConfirm();
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  const [
    clearResult,
    { loading: clearLoading, error: clearError },
  ] = useMutation(CLEAR_RESULT_ATTEMPTS, {
    variables: { id: result && result.id },
    onCompleted: onClose,
  });

  function handleEditClick() {
    onEditClick();
    onClose();
  }

  function handleClearClick() {
    confirm({
      description: `This will clear all attempts of ${result.person.name}.`,
    }).then(clearResult);
  }

  function handleQuitClick() {
    setQuitDialogOpen(true);
  }

  return (
    <>
      <Menu
        open={Boolean(result && position)}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={position}
        transformOrigin={{ vertical: 0, horizontal: 'center' }}
        MenuListProps={{
          subheader: (
            <ListSubheader>{result && result.person.name}</ListSubheader>
          ),
        }}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem
          component={RouterLink}
          to={`/competitions/${competitionId}/competitors/${
            result && result.person.id
          }`}
        >
          Results
        </MenuItem>
        {result && result.attempts.length > 0 ? (
          <MenuItem onClick={handleClearClick} disabled={clearLoading}>
            Clear
          </MenuItem>
        ) : (
          <MenuItem onClick={handleQuitClick}>Quit</MenuItem>
        )}
      </Menu>
      {clearError && <ErrorSnackbar error={clearError} />}
      {quitDialogOpen && (
        <QuitCompetitorDialog
          open={quitDialogOpen}
          onClose={() => {
            setQuitDialogOpen(false);
            onClose();
          }}
          competitor={result.person}
          roundId={roundId}
        />
      )}
    </>
  );
}

export default ResultMenu;
