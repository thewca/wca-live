import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Grid, Link, Typography } from "@mui/material";

import useApolloErrorHandler from "../../hooks/useApolloErrorHandler";
import CompetitionSearch from "../CompetitionSearch/CompetitionSearch";
import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import ScoretakingTokensTable from "../ScoretakingTokensTable/ScoretakingTokensTable";

const ACTIVE_SCORETAKING_TOKENS_QUERY = gql`
  query ActiveScoretakingTokensQuery {
    activeScoretakingTokens {
      id
      token
      insertedAt
      competition {
        id
        name
      }
    }
  }
`;

const GENERATE_SCORETAKING_TOKEN = gql`
  mutation GenerateScoretakingToken($input: GenerateScoretakingTokenInput!) {
    generateScoretakingToken(input: $input) {
      scoretakingToken {
        id
      }
    }
  }
`;

function ScoretakingTokens() {
  const apolloErrorHandler = useApolloErrorHandler();

  const [competition, setCompetition] = useState(null);

  const { data, loading, error } = useQuery(ACTIVE_SCORETAKING_TOKENS_QUERY);

  const [generateScoretakingToken, { loading: mutationLoading }] = useMutation(
    GENERATE_SCORETAKING_TOKEN,
    {
      variables: {
        input: {
          competitionId: competition && competition.id,
        },
      },
      onError: apolloErrorHandler,
      onCompleted: () => {
        setCompetition(null);
      },
      refetchQueries: [ACTIVE_SCORETAKING_TOKENS_QUERY],
    }
  );

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;

  const { activeScoretakingTokens } = data;

  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Scoretaking tokens
          </Typography>
          <Typography color="textSecondary">
            Generate a personal token for a specific competition. You can use
            this token programmatically enter results from an external software
            (such as a dedicated scoretaking device). For API specifics check
            out{" "}
            <Link
              href="https://github.com/thewca/wca-live/wiki/Entering-attempts-with-external-devices"
              underline="hover"
            >
              this page
            </Link>
            .
          </Typography>
        </Grid>
        <Grid item>
          <CompetitionSearch
            onChange={(competition) => setCompetition(competition)}
            value={competition}
            TextFieldProps={{
              placeholder: "Competition",
              size: "small",
              style: { width: 350 },
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disabled={mutationLoading || !competition}
            onClick={() => generateScoretakingToken()}
          >
            Generate
          </Button>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2" mb={0.5}>
            Active tokens
          </Typography>
          <ScoretakingTokensTable
            scoretakingTokens={activeScoretakingTokens}
            activeScoretakingTokensQuery={ACTIVE_SCORETAKING_TOKENS_QUERY}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default ScoretakingTokens;
