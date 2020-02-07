import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { withRouter, Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useConfirm } from 'material-ui-confirm';
import { makeStyles } from '@material-ui/core/styles';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import { formatDateRange } from '../../../logic/date';

const IMPORT_COMPETITION_MUTATION = gql`
  mutation ImportCompetition($id: ID!) {
    importCompetition(id: $id) {
      id
      name
    }
  }
`;

const useStyles = makeStyles(theme => ({
  scrollable: {
    maxHeight: 240,
    overflowY: 'auto',
  },
}));

const AdminCompetitionList = ({
  manageableCompetitions,
  importableCompetitions,
  history,
}) => {
  const classes = useStyles();
  const confirm = useConfirm();
  const [importCompetition, { loading, error }] = useMutation(
    IMPORT_COMPETITION_MUTATION,
    {
      onCompleted: ({ importCompetition }) => {
        history.push(`/admin/competitions/${importCompetition.id}`);
      },
    }
  );

  return (
    <List dense={true}>
      <ListSubheader disableSticky>Manageable competitions</ListSubheader>
      <div className={classes.scrollable}>
        {manageableCompetitions
          .slice()
          .reverse()
          .map(competition => (
            <ListItem
              key={competition.id}
              button
              component={Link}
              to={`/admin/competitions/${competition.id}`}
            >
              <ListItemText
                primary={competition.name}
                secondary={formatDateRange(
                  competition.schedule.startDate,
                  competition.schedule.endDate
                )}
              />
            </ListItem>
          ))}
      </div>
      <ListSubheader disableSticky>Importable competitions</ListSubheader>
      {importableCompetitions.map(competition => (
        <ListItem
          key={competition.id}
          button
          onClick={() => {
            confirm({
              description: `This will import ${competition.name} from the WCA website.`,
            }).then(() =>
              importCompetition({ variables: { id: competition.id } })
            );
          }}
          disabled={loading}
        >
          <ListItemText
            primary={competition.name}
            secondary={formatDateRange(
              competition.schedule.startDate,
              competition.schedule.endDate
            )}
          />
        </ListItem>
      ))}
      {error && <ErrorSnackbar error={error} />}
    </List>
  );
};

export default withRouter(AdminCompetitionList);
