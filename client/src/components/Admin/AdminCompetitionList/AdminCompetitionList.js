import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';

const COMPETITIONS_QUERY = gql`
  query CompetitionsQuery {
    me {
      id
      manageableCompetitions {
        id
        name
      }
      importableCompetitions {
        id
        name
      }
    }
  }
`;

const AdminCompetitionList = () => {
  return (
    <Query query={COMPETITIONS_QUERY}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <LinearProgress />;
        const { me: { importableCompetitions, manageableCompetitions } } = data;
        return (
          <div style={{ padding: 24 }}>
            <Paper>
              <List>
                <ListSubheader>Manageable competitions</ListSubheader>
                {manageableCompetitions.map(competition => (
                  <ListItem
                    key={competition.id}
                    button
                    component={Link}
                    to={`/admin/competitions/${competition.id}`}
                  >
                    <ListItemText primary={competition.name} />
                  </ListItem>
                ))}
                <ListSubheader>Importable competitions</ListSubheader>
                {importableCompetitions.map(competition => (
                  <ListItem key={competition.id} button>
                    <ListItemText primary={competition.name} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </div>
        );
      }}
    </Query>
  )
};

export default AdminCompetitionList;
