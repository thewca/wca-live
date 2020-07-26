import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import StaffMembersTable from './StaffMembersTable';
import UserSearch from '../../UserSearch/UserSearch';

const UPDATE_COMPETITION_ACCESS_SETTINGS_MUTATION = gql`
  mutation UpdateCompetitionAccessSettings(
    $input: UpdateCompetitionAccessSettingsInput!
  ) {
    updateCompetitionAccessSettings(input: $input) {
      competition {
        id
        staffMembers {
          id
          user {
            id
          }
          roles
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  fullWidth: {
    width: '100%',
  },
  actions: {
    marginTop: theme.spacing(2),
  },
  searchTextField: {
    width: 250,
  },
}));

function staffMemberToInput(staffMember) {
  const { id, user, roles } = staffMember;
  return { id, userId: user.id, roles };
}

function staffMembersToInputs(staffMembers) {
  return staffMembers
    .filter((staffMember) => staffMember.roles.length > 0)
    .map(staffMemberToInput);
}

function AccessSettings({ competition }) {
  const classes = useStyles();
  const [staffMembers, setStaffMembers] = useState(competition.staffMembers);

  const [updateAccessSettings, { error, loading }] = useMutation(
    UPDATE_COMPETITION_ACCESS_SETTINGS_MUTATION,
    {
      variables: {
        input: {
          id: competition.id,
          staffMembers: staffMembersToInputs(staffMembers),
        },
      },
    }
  );

  function handleUserSearch(user) {
    if (user === null) return;
    if (staffMembers.some((staffMember) => staffMember.user.id === user.id))
      return;
    const staffMember = {
      id: null,
      user,
      roles: [],
    };
    setStaffMembers([...staffMembers, staffMember]);
  }

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          Competition access
        </Typography>
        <Typography>
          {`Delegates and organizers have full access to the competition.
            Additionally, you can grant scoretaking access to any WCA Live user.`}
        </Typography>
      </Grid>
      <Grid item className={classes.fullWidth}>
        <Paper>
          <StaffMembersTable
            staffMembers={staffMembers}
            onChange={setStaffMembers}
          />
        </Paper>
      </Grid>
      <Grid item>
        <UserSearch
          onChange={handleUserSearch}
          TextFieldProps={{
            label: 'Add user',
            className: classes.searchTextField,
          }}
        />
      </Grid>
      <Grid item className={classes.actions}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateAccessSettings}
          disabled={loading}
        >
          Save
        </Button>
        {error && <ErrorSnackbar error={error} />}
      </Grid>
    </Grid>
  );
}

export default AccessSettings;
