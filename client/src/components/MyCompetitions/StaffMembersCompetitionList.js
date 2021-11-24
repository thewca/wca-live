import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import VirtualList from '../VirtualList/VirtualList';
import CompetitionFlagIcon from '../CompetitionFlagIcon/CompetitionFlagIcon';
import { formatDateRange } from '../../lib/date';
import { roleToLabel } from '../../lib/staff-member';

function StaffMembersCompetitionList({ title, staffMembers }) {
  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <VirtualList
        maxHeight={300}
        itemHeight={60}
        items={staffMembers}
        renderItem={(staffMember, { style }) => {
          const competition = staffMember.competition;

          return (
            <ListItem
              key={competition.id}
              style={style}
              button
              component={Link}
              to={`/admin/competitions/${competition.id}`}
            >
              <ListItemIcon>
                <ListItemIcon>
                  <CompetitionFlagIcon competition={competition} />
                </ListItemIcon>
              </ListItemIcon>
              <ListItemText
                primary={competition.name}
                secondary={formatDateRange(
                  competition.startDate,
                  competition.endDate
                )}
              />
              <Box sx={{ display: 'flex' }}>
                {staffMember.roles.map((role) => (
                  <Chip
                    key={role}
                    label={roleToLabel(role)}
                    size="small"
                    color="secondary"
                    sx={{
                      fontWeight: 500,
                      margin: 0.5,
                    }}
                  />
                ))}
              </Box>
            </ListItem>
          );
        }}
      />
    </List>
  );
}

export default StaffMembersCompetitionList;
