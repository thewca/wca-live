import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

const RoomLabel = ({ room }) => (
  <Tooltip title={room.name} placement="top">
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '100%',
        backgroundColor: room.color,
      }}
    />
  </Tooltip>
);

export default RoomLabel;
