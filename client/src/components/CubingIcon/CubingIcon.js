import React from 'react';

const CubingIcon = ({ eventId, ...props }) => (
  <span
    style={{ fontSize: 24 }}
    className={`cubing-icon event-${eventId}`}
    {...props}
  />
);

export default CubingIcon;
