import { Box, Grid } from "@mui/material";
import OneTimeCode from "../OneTimeCode/OneTimeCode";
import ScoretakingTokens from "../ScoretakingTokens/ScoretakingTokens";

function Account() {
  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Grid container direction="column" gap={6}>
        <Grid item>
          <OneTimeCode />
        </Grid>
        <Grid item>
          <ScoretakingTokens />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Account;
