import React from 'react';

const CubingIcon = ({ eventId, ...props }) => (
  <span
    style={{ fontSize: 24, color: 'rgba(0, 0, 0, 0.54)' }}
    className={`cubing-icon event-${eventId}`}
    {...props}
  />
);

export default CubingIcon;
