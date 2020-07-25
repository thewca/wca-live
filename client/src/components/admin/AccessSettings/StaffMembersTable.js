import React, { useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({}));

const rolesData = [
  { role: 'organizer', name: 'Organizer', editable: false },
  { role: 'delegate', name: 'Delegate', editable: false },
  { role: 'staff-dataentry', name: 'Scoretaker', editable: true },
];

const toggleElement = (array, element) => {
  if (array.includes(element)) {
    return array.filter((other) => other !== element);
  } else {
    return [...array, element];
  }
};

const StaffMembersTable = ({ staffMembers, onChange }) => {
  const classes = useStyles();

  const handleRoleToggle = (staffMember, role) => {
    onChange(
      staffMembers.map((other) =>
        other === staffMember
          ? { ...other, roles: toggleElement(other.roles, role) }
          : other
      )
    );
  };

  return (
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
          <TableRow key={staffMember.user.id}>
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
  );
};

export default StaffMembersTable;
