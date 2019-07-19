import React from 'react';
import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';

/* Waits 800ms before showing LinearProgress. */
const Loading = () => {
  return (
    <Fade in={true} style={{ transitionDelay: '800ms' }}>
      <LinearProgress />
    </Fade>
  );
};

export default Loading;
