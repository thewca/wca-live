import { Divider, Grid, Box, useMediaQuery } from "@mui/material";
import SignInCode from "./SignInCode";
import SignInWca from "./SignInWca";

function SignIn() {
  const mdScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <Box sx={{ height: "100%", p: 4 }}>
      <Grid container alignItems="center" sx={{ height: "100%" }} spacing={4}>
        <Grid item xs={12} md>
          <SignInWca />
        </Grid>
        {mdScreen && <Divider orientation="vertical" flexItem />}
        <Grid item xs={12} md>
          <SignInCode />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SignIn;
