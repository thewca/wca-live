import React from 'react';
import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';

/* Waits 800ms before showing LinearProgress. */
function Loading() {
  return (
    <Fade in={true} style={{ transitionDelay: '800ms' }}>
      <LinearProgress
        style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
      />
    </Fade>
  );
}

export default Loading;
