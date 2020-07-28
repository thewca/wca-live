import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { ListItem, ListItemText } from '@material-ui/core';
import { useConfirm } from 'material-ui-confirm';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';
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
  const apolloErrorHandler = useApolloErrorHandler();

  const [importCompetition, { loading }] = useMutation(
    IMPORT_COMPETITION_MUTATION,
    {
      variables: { input: { wcaId: competition.wcaId } },
      onCompleted: ({ importCompetition: { competition } }) => {
        history.push(`/admin/competitions/${competition.id}`);
      },
      onError: apolloErrorHandler,
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
    </ListItem>
  );
}

export default ImportableCompetitionListItem;
