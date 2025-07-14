import { gql, useMutation } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TimeAgo from "react-timeago";
import { parseISO } from "date-fns";
import { useConfirm } from "material-ui-confirm";

import { orderBy } from "../../lib/utils";
import useApolloErrorHandler from "../../hooks/useApolloErrorHandler";

const DELETE_SCORETAKING_TOKEN_MUTATION = gql`
  mutation DeleteScoretakingToken($input: DeleteScoretakingTokenInput!) {
    deleteScoretakingToken(input: $input) {
      scoretakingToken {
        id
      }
    }
  }
`;

function ScoretakingTokensTable({
  scoretakingTokens,
  activeScoretakingTokensQuery,
}) {
  const confirm = useConfirm();
  const apolloErrorHandler = useApolloErrorHandler();

  const [deleteScoretakingToken, { loading }] = useMutation(
    DELETE_SCORETAKING_TOKEN_MUTATION,
    {
      onError: apolloErrorHandler,
      refetchQueries: [activeScoretakingTokensQuery],
    },
  );

  function handleDelete(scoretakingToken) {
    confirm({
      description: `
        This will remove the scoretaking token for ${scoretakingToken.competition.name}.
      `,
    }).then(() => {
      deleteScoretakingToken({
        variables: { input: { id: scoretakingToken.id } },
      });
    });
  }

  const sortedScoretakingTokens = orderBy(
    scoretakingTokens,
    (token) => [token.insertedAt],
    ["desc"],
  );

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Competition</TableCell>
            <TableCell>Created</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedScoretakingTokens.map((scoretakingToken) => (
            <TableRow key={scoretakingToken.id}>
              <TableCell>{scoretakingToken.competition.name}</TableCell>
              <TableCell>
                <TimeAgo date={parseISO(scoretakingToken.insertedAt)} />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => handleDelete(scoretakingToken)}
                  size="small"
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ScoretakingTokensTable;
