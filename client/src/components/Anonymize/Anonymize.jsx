import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";

import useApolloErrorHandler from "../../hooks/useApolloErrorHandler";

const ANONYMIZE_PERSON_MUTATION = gql`
  mutation AnonymizePerson($input: AnonymizePersonInput!) {
    anonymizePerson(input: $input) {
      competitionCount
    }
  }
`;

function Anonymize() {
  const [wcaId, setWcaId] = useState("");
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();

  const apolloErrorHandler = useApolloErrorHandler();

  const [anonymizePerson, { loading }] = useMutation(
    ANONYMIZE_PERSON_MUTATION,
    {
      variables: { input: { wcaId } },
      onError: apolloErrorHandler,
      onCompleted: ({ anonymizePerson: { competitionCount } }) => {
        setWcaId("");
        enqueueSnackbar(
          `Anonymized personal data across ${competitionCount} competitions`,
          { variant: "info" }
        );
      },
    }
  );

  const anonymize = () => {
    confirm({
      description: `
      Are you sure you want to anonymize personal data for ${wcaId}? Type the WCA ID below to confirm.
      `,
      confirmationKeyword: wcaId,
      confirmationKeywordTextFieldProps: {
        sx: { mt: 2 },
        autoComplete: "off",
      },
    }).then(anonymizePerson);
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h5" gutterBottom>
            Anonymize
          </Typography>
          <Typography color="textSecondary">
            This will anonymize all personal information for person with the
            given WCA ID, across all competitions stored in the database.
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            label="WCA ID"
            value={wcaId}
            onChange={(event) => setWcaId(event.target.value.toUpperCase())}
            inputProps={{ maxLength: 10 }}
            autoComplete="off"
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disabled={!wcaId || loading}
            onClick={anonymize}
          >
            Anonymize
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Anonymize;
