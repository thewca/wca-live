import React from 'react';
import { Link } from 'react-router-dom';
import {
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VirtualList from '../VirtualList/VirtualList';
import CompetitionFlagIcon from '../CompetitionFlagIcon/CompetitionFlagIcon';
import { formatDateRange } from '../../lib/date';
import { roleToLabel } from '../../lib/staff-member';

const useStyles = makeStyles((theme) => ({
  rolesContainer: {
    display: 'flex',
  },
  roleChip: {
    fontWeight: 500,
    margin: theme.spacing(0.5),
  },
}));

function StaffMembersCompetitionList({ title, staffMembers }) {
  const classes = useStyles();

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
              <div className={classes.rolesContainer}>
                {staffMember.roles.map((role) => (
                  <Chip
                    key={role}
                    label={roleToLabel(role)}
                    size="small"
                    color="secondary"
                    className={classes.roleChip}
                  />
                ))}
              </div>
            </ListItem>
          );
        }}
      />
    </List>
  );
}

export default StaffMembersCompetitionList;
