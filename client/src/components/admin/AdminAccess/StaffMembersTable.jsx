import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";

const rolesData = [
  { role: "organizer", name: "Organizer", editable: false },
  { role: "delegate", name: "Delegate", editable: false },
  { role: "trainee-delegate", name: "Trainee delegate", editable: false },
  { role: "staff-dataentry", name: "Scoretaker", editable: true },
];

function toggleElement(array, element) {
  if (array.includes(element)) {
    return array.filter((other) => other !== element);
  } else {
    return [...array, element];
  }
}

function StaffMembersTable({ staffMembers, onChange }) {
  function handleRoleToggle(staffMember, role) {
    onChange(
      staffMembers.map((other) =>
        other === staffMember
          ? { ...other, roles: toggleElement(other.roles, role) }
          : other,
      ),
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            {rolesData.map(({ role, name }) => (
              <TableCell key={role}>{name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {staffMembers.map((staffMember) => (
            <TableRow
              key={staffMember.user.id}
              sx={{ "&:last-child td": { border: 0 } }}
            >
              <TableCell>{staffMember.user.name}</TableCell>
              {rolesData.map(({ role, editable }) => (
                <TableCell key={role} padding="checkbox" align="center">
                  <Checkbox
                    disabled={!editable}
                    checked={staffMember.roles.includes(role)}
                    onChange={() => handleRoleToggle(staffMember, role)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default StaffMembersTable;
