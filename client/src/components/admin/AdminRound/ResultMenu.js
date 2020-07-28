import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListSubheader, Menu, MenuItem } from '@material-ui/core';

function ResultMenu({
  result,
  position,
  onClose,
  onEditClick,
  onQuitClick,
  onClearClick,
  competitionId,
}) {
  function handleEditClick() {
    onEditClick(result);
    onClose();
  }

  function handleClearClick() {
    onClearClick(result);
    onClose();
  }

  function handleQuitClick() {
    onQuitClick(result);
    onClose();
  }

  return (
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
        <MenuItem onClick={handleClearClick}>Clear</MenuItem>
      ) : (
        <MenuItem onClick={handleQuitClick}>Quit</MenuItem>
      )}
    </Menu>
  );
}

export default ResultMenu;
