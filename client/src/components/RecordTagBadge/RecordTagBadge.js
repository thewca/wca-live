import { Box } from '@mui/material';
import RecordTag from '../RecordTag/RecordTag';

function RecordTagBadge({
  recordTag,
  hidePr = false,
  litePr = false,
  children,
}) {
  if (!recordTag || (hidePr && recordTag === 'PR')) {
    return children;
  }

  return (
    <Box component="span" sx={{ position: 'relative' }}>
      {children}
      <RecordTag
        recordTag={recordTag}
        litePr={litePr}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(110%, -40%)',
          fontSize: '0.6em',
          py: '0.3em',
          px: '0.4em',
        }}
      />
    </Box>
  );
}

export default RecordTagBadge;
