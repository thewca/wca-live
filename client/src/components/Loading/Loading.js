import React from 'react';
import { Fade, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
}));

/* Waits 800ms before showing LinearProgress. */
function Loading() {
  const classes = useStyles();

  return (
    <Fade in={true} style={{ transitionDelay: '800ms' }}>
      <LinearProgress className={classes.progress} />
    </Fade>
  );
}

export default Loading;
