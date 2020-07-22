import React, { useState, Fragment } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useConfirm } from 'material-ui-confirm';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import QuitCompetitorDialog from '../QuitCompetitorDialog/QuitCompetitorDialog';

const ResultMenu = ({
  position,
  result,
  onClose,
  onEditClick,
  competitionId,
  roundId,
  updateResultMutation,
}) => {
  const confirm = useConfirm();
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  const [
    clearResult,
    { loading: clearLoading, error: clearError },
  ] = useMutation(updateResultMutation, {
    variables: {
      competitionId,
      roundId,
      result: { personId: result && result.person.id, attempts: [] },
    },
    onCompleted: onClose,
  });

  if (!position || !result) return null;

  return (
    <Fragment>
      <Menu
        open={true}
        onClose={onClose}
        anchorPosition={position}
        anchorReference="anchorPosition"
        transformOrigin={{ vertical: 0, horizontal: 'center' }}
        MenuListProps={{
          subheader: <ListSubheader>{result.person.name}</ListSubheader>,
        }}
      >
        <MenuItem
          onClick={() => {
            onEditClick();
            onClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/competitions/${competitionId}/competitors/${result.person.id}`}
        >
          Results
        </MenuItem>
        {result.attempts.length > 0 ? (
          <MenuItem
            onClick={() => {
              confirm({
                description: `This will clear all attempts of ${result.person.name}.`,
              }).then(clearResult);
            }}
            disabled={clearLoading}
          >
            Clear
          </MenuItem>
        ) : (
          <MenuItem onClick={() => setQuitDialogOpen(true)}>Quit</MenuItem>
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
          competitionId={competitionId}
          roundId={roundId}
        />
      )}
    </Fragment>
  );
};

export default ResultMenu;
