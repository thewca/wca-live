/**
 * Returns a friendly title for the given staff member role.
 */
export function roleToLabel(role) {
  switch (role) {
    case 'delegate':
      return 'Delegate';
    case 'organizer':
      return 'Organizer';
    case 'staff-dataentry':
      return 'Scoretaker';
    default:
      return role;
  }
}
