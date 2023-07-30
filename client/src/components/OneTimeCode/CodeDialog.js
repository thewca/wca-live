import { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
} from '@mui/material';
import { parseISO } from 'date-fns';

function getExpirationPercent(oneTimeCode) {
  const expiresAt = parseISO(oneTimeCode.expiresAt);
  const insertedAt = parseISO(oneTimeCode.insertedAt);
  const now = new Date();
  const ttlMs = expiresAt - insertedAt;
  const expiresInMs = Math.max(expiresAt - now, 0);
  return 100 - (expiresInMs / ttlMs) * 100;
}

function CodeDialog({ oneTimeCode, open, onClose }) {
  const [expirationPercent, setExpirationPercent] = useState(0);

  const expired = !!oneTimeCode && getExpirationPercent(oneTimeCode) === 100;

  useEffect(() => {
    if (open && oneTimeCode && !expired) {
      const interval = setInterval(() => {
        const percent = getExpirationPercent(oneTimeCode);
        setExpirationPercent(percent);
      }, 25);

      return () => clearInterval(interval);
    }
  }, [oneTimeCode, expired, open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Grid container direction="column" spacing={2} alignItems="center">
          <Grid item>
            <Typography color="textSecondary">
              Navigate to the sign in page on another device and enter the
              following code.
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h4" align="center">
              {expired ? 'Expired' : oneTimeCode && oneTimeCode.code}
            </Typography>
          </Grid>
          <Grid item style={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={100 - expirationPercent}
            />
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

export default CodeDialog;
