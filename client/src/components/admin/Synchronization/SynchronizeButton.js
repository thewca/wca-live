import { gql, useMutation } from '@apollo/client';
import { Button } from '@mui/material';
import useApolloErrorHandler from '../../../hooks/useApolloErrorHandler';

const SYNCHRONIZE_MUTATION = gql`
  mutation Synchronize($input: SynchronizeCompetitionInput!) {
    synchronizeCompetition(input: $input) {
      competition {
        id
        synchronizedAt
      }
    }
  }
`;

function SynchronizeButton({ competitionId }) {
  const apolloErrorHandler = useApolloErrorHandler();

  const [synchronize, { loading }] = useMutation(SYNCHRONIZE_MUTATION, {
    variables: { input: { id: competitionId } },
    onError: apolloErrorHandler,
  });

  return (
    <Button
      variant="contained"
      disableElevation
      color="primary"
      size="large"
      onClick={synchronize}
      disabled={loading}
    >
      Synchronize
    </Button>
  );
}

export default SynchronizeButton;
