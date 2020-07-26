import React from 'react';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '100%',
  },
}));

function RoomLabel({ room }) {
  const classes = useStyles();

  return (
    <Tooltip title={room.name} placement="top">
      <span className={classes.dot} style={{ backgroundColor: room.color }} />
    </Tooltip>
  );
}

export default RoomLabel;
