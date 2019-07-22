import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import withConfirm from 'material-ui-confirm';

import Loading from '../../Loading/Loading';
import { formatDateRange } from '../../../logic/utils';

const COMPETITIONS_QUERY = gql`
  query Competitions {
    me {
      id
      manageableCompetitions {
        ...competitionInfo
      }
      importableCompetitions {
        ...competitionInfo
      }
    }
  }

  fragment competitionInfo on Competition {
    id
    name
    startDate
    endDate
  }
`;

const IMPORT_COMPETITION_MUTATION = gql`
  mutation ImportCompetition($id: ID!) {
    importCompetition(id: $id) {
      id
      name
    }
  }
`;

const AdminCompetitionList = ({ confirm, history }) => {
  return (
    <Query query={COMPETITIONS_QUERY}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { me: { importableCompetitions, manageableCompetitions } } = data;
        return (
          <div style={{ padding: 24 }}>
            <Paper>
              <List dense={true}>
                <ListSubheader disableSticky>Manageable competitions</ListSubheader>
                {manageableCompetitions.map(competition => (
                  <ListItem
                    key={competition.id}
                    button
                    component={Link}
                    to={`/admin/competitions/${competition.id}`}
                  >
                    <ListItemText
                      primary={competition.name}
                      secondary={formatDateRange(competition.startDate, competition.endDate)}
                    />
                  </ListItem>
                ))}
                <ListSubheader disableSticky>Importable competitions</ListSubheader>
                {importableCompetitions.map(competition => (
                  <Mutation
                    key={competition.id}
                    mutation={IMPORT_COMPETITION_MUTATION}
                    variables={{ id: competition.id }}
                    onCompleted={() => history.push(`/admin/competitions/${competition.id}`)}
                    update={(cache, { data: { importCompetition } }) => {
                      const { me } = cache.readQuery({ query: COMPETITIONS_QUERY });
                      cache.writeQuery({
                        query: COMPETITIONS_QUERY,
                        data: { me: {
                          ...me,
                          manageableCompetitions: me.manageableCompetitions
                            .concat(importCompetition),
                          importableCompetitions: me.importableCompetitions
                            .filter(importable => importable.id !== importCompetition.id),
                        }},
                      });
                    }}
                  >
                    {(importCompetition, { loading }) => (
                      <ListItem
                        button
                        onClick={confirm(importCompetition, {
                          description: `This will import ${competition.name} from the WCA website.`,
                        })}
                        disabled={loading}
                      >
                        <ListItemText
                          primary={competition.name}
                          secondary={formatDateRange(competition.startDate, competition.endDate)}
                        />
                      </ListItem>
                    )}
                  </Mutation>
                ))}
              </List>
            </Paper>
          </div>
        );
      }}
    </Query>
  )
};

export default withConfirm(AdminCompetitionList);
