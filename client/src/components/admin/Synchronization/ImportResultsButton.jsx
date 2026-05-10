import { gql, useMutation } from "@apollo/client";
import { Button } from "@mui/material";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";

const IMPORT_RESULTS_MUTATION = gql`
  mutation ImportResults($input: ImportResultsInput!) {
    importResults(input: $input) {
      competition {
        id
        synchronizedAt
      }
    }
  }
`;

function ImportResultsButton({ competitionId }) {
  const apolloErrorHandler = useApolloErrorHandler();

  const [importResults, { loading }] = useMutation(IMPORT_RESULTS_MUTATION, {
    variables: { input: { id: competitionId } },
    onError: apolloErrorHandler,
  });

  return (
    <Button
      variant="contained"
      disableElevation
      color="primary"
      onClick={importResults}
      disabled={loading}
    >
      Import results
    </Button>
  );
}

export default ImportResultsButton;
