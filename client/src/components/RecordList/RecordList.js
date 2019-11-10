import React from 'react';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';

import CustomQuery from '../CustomQuery/CustomQuery';
import RecordTag from '../RecordTag/RecordTag';
import { formatAttemptResult } from '../../logic/attempts';

const RECENT_RECORDS_QUERY = gql`
  query RecentRecords {
    recentRecords {
      competition {
        id
      }
      event {
        _id
        id
        name
      }
      round {
        _id
        id
      }
      result {
        _id
        person {
          _id
          name
          country {
            name
          }
        }
      }
      type
      recordTag
      attemptResult
    }
  }
`;

const useStyles = makeStyles(theme => ({
  container: {
    maxHeight: 300,
    overflowY: 'auto',
  },
}));

const RecordList = () => {
  const classes = useStyles();
  return (
    <List dense={true} disablePadding>
      <ListSubheader disableSticky>Recent records</ListSubheader>
      <CustomQuery query={RECENT_RECORDS_QUERY}>
        {({ data: { recentRecords } }) => (
          <div className={classes.container}>
            {recentRecords.map((record, index) => (
              <ListItem
                key={index}
                button
                component={Link}
                to={`/competitions/${record.competition.id}/rounds/${record.round.id}`}
              >
                <ListItemIcon>
                  <RecordTag recordTag={record.recordTag} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span>
                      <span>{`${record.event.name} ${record.type} of `}</span>
                      <span style={{ fontWeight: 600 }}>
                        {`${formatAttemptResult(
                          record.attemptResult,
                          record.event.id,
                          record.type === 'average'
                        )}`}
                      </span>
                    </span>
                  }
                  secondary={`${record.result.person.name} from ${record.result.person.country.name}`}
                />
              </ListItem>
            ))}
          </div>
        )}
      </CustomQuery>
    </List>
  );
};

export default RecordList;
