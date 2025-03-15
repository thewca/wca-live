import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Button, Grid, Typography } from "@mui/material";
import StaffMembersTable from "./StaffMembersTable";
import UserSearch from "../../UserSearch/UserSearch";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";

const UPDATE_COMPETITION_ACCESS_MUTATION = gql`
  mutation UpdateCompetitionAccess($input: UpdateCompetitionAccessInput!) {
    updateCompetitionAccess(input: $input) {
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

function staffMemberToInput(staffMember) {
  const { id, user, roles } = staffMember;
  return { id, userId: user.id, roles };
}

function staffMembersToInputs(staffMembers) {
  return staffMembers
    .filter((staffMember) => staffMember.roles.length > 0)
    .map(staffMemberToInput);
}

function AdminAccess({ competition }) {
  const apolloErrorHandler = useApolloErrorHandler();
  const [staffMembers, setStaffMembers] = useState(competition.staffMembers);

  const [updateAccess, { loading }] = useMutation(
    UPDATE_COMPETITION_ACCESS_MUTATION,
    {
      variables: {
        input: {
          id: competition.id,
          staffMembers: staffMembersToInputs(staffMembers),
        },
      },
      onError: apolloErrorHandler,
    },
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
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography>
          {`Delegates and organizers have full access to the competition.
            Additionally, you can grant scoretaking access to any WCA Live user.`}
        </Typography>
      </Grid>
      <Grid item sx={{ width: "100%" }}>
        <StaffMembersTable
          staffMembers={staffMembers}
          onChange={setStaffMembers}
        />
      </Grid>
      <Grid item>
        <UserSearch
          onChange={handleUserSearch}
          TextFieldProps={{
            label: "Add user",
            sx: { width: 250 },
            variant: "outlined",
            size: "small",
          }}
        />
      </Grid>
      <Grid item sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateAccess}
          disabled={loading}
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
}

export default AdminAccess;
