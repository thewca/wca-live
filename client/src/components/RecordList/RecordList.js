import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';
import RecordTag from '../RecordTag/RecordTag';
import { formatAttemptResult } from '../../lib/attempts';

const RECENT_RECORDS_QUERY = gql`
  query RecentRecords {
    recentRecords {
      id
      tag
      type
      attemptResult
      result {
        id
        person {
          id
          name
          country {
            name
          }
        }
        round {
          id
          competitionEvent {
            id
            event {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: 300,
    overflowY: 'auto',
  },
}));

const RecordList = () => {
  const classes = useStyles();
  const { data, loading, error } = useQuery(RECENT_RECORDS_QUERY);
  if (error) return <ErrorSnackbar />;

  return (
    <List dense={true} disablePadding>
      <ListSubheader disableSticky>Recent records</ListSubheader>
      {loading && !data ? (
        <Loading />
      ) : (
        <div className={classes.container}>
          {data.recentRecords.map((record, index) => (
            <ListItem
              key={index}
              button
              component={Link}
              to={`/rounds/${record.result.round.id}`}
            >
              <ListItemIcon>
                <RecordTag recordTag={record.tag} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span>
                    <span>{`${record.result.round.competitionEvent.event.name} ${record.type} of `}</span>
                    <span style={{ fontWeight: 600 }}>
                      {`${formatAttemptResult(
                        record.attemptResult,
                        record.result.round.competitionEvent.event.id,
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
    </List>
  );
};

export default RecordList;
