import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RecordTag from '../RecordTag/RecordTag';
import { formatAttemptResult } from '../../lib/attempt-result';

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: 300,
    overflowY: 'auto',
  },
  attemptResult: {
    fontWeight: 600,
  },
}));

function RecordList({ title, records }) {
  const classes = useStyles();

  return (
    <List dense={true} disablePadding>
      {title && <ListSubheader disableSticky>{title}</ListSubheader>}
      <div className={classes.container}>
        {records.map((record) => (
          <ListItem
            key={record.id}
            button
            component={Link}
            to={`/competitions/${record.result.round.competitionEvent.competition.id}/rounds/${record.result.round.id}`}
          >
            <ListItemIcon>
              <RecordTag recordTag={record.tag} />
            </ListItemIcon>
            <ListItemText
              primary={
                <span>
                  <span>{`${record.result.round.competitionEvent.event.name} ${record.type} of `}</span>
                  <span className={classes.attemptResult}>
                    {`${formatAttemptResult(
                      record.attemptResult,
                      record.result.round.competitionEvent.event.id
                    )}`}
                  </span>
                </span>
              }
              secondary={`${record.result.person.name} from ${record.result.person.country.name}`}
            />
          </ListItem>
        ))}
      </div>
    </List>
  );
}

export default RecordList;
