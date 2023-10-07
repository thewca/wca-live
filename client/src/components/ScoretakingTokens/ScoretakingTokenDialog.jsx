import {
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

function ScoretakingTokenDialog({ token, open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Grid container direction="column" spacing={2} alignItems="center">
          <Grid item>
            <Typography color="textSecondary">
              Copy and save the token, you won't be able to see it again.
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" align="center">
              {token}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => onClose()}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ScoretakingTokenDialog;
