import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useConfirm } from 'material-ui-confirm';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import { formatDateRange } from '../../../lib/date';

const IMPORT_COMPETITION_MUTATION = gql`
  mutation ImportCompetition($input: ImportCompetitionInput!) {
    importCompetition(input: $input) {
      competition {
        id
      }
    }
  }
`;

function ImportableCompetitionListItem({ competition }) {
  const confirm = useConfirm();
  const history = useHistory();

  const [importCompetition, { loading, error }] = useMutation(
    IMPORT_COMPETITION_MUTATION,
    {
      variables: { input: { wcaId: competition.wcaId } },
      onCompleted: ({ importCompetition: { competition } }) => {
        history.push(`/admin/competitions/${competition.id}`);
      },
    }
  );

  function handleClick() {
    confirm({
      description: `This will import ${competition.name} from the WCA website.`,
    }).then(() => importCompetition());
  }

  return (
    <ListItem
      key={competition.wcaId}
      button
      onClick={handleClick}
      disabled={loading}
    >
      <ListItemText
        primary={competition.name}
        secondary={formatDateRange(competition.startDate, competition.endDate)}
      />
      {error && <ErrorSnackbar error={error} />}
    </ListItem>
  );
}

export default ImportableCompetitionListItem;
