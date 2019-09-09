import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import withConfirm from 'material-ui-confirm';

import CustomMutation from '../../CustomMutation/CustomMutation';
import QuitCompetitorDialog from '../QuitCompetitorDialog/QuitCompetitorDialog';

const ResultMenu = ({
  position,
  result,
  onClose,
  competitionId,
  roundId,
  updateResultMutation,
  confirm,
}) => {
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

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
          component={Link}
          to={`/competitions/${competitionId}/competitors/${result.person.id}`}
        >
          Results
        </MenuItem>
        {result.attempts.length > 0 ? (
          <CustomMutation
            mutation={updateResultMutation}
            variables={{
              competitionId,
              roundId,
              result: { personId: result.person.id, attempts: [] },
            }}
            onCompleted={onClose}
          >
            {(clearResult, { loading }) => (
              <MenuItem
                onClick={confirm(clearResult, {
                  description: `This will clear all attempts of ${result.person.name}.`,
                })}
                disabled={loading}
              >
                Clear
              </MenuItem>
            )}
          </CustomMutation>
        ) : (
          <MenuItem onClick={() => setQuitDialogOpen(true)}>Quit</MenuItem>
        )}
      </Menu>
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
    </Fragment>
  );
};

export default withConfirm(ResultMenu);
