import React from 'react';

import FmField from './FmField/FmField';
import MbldField from './MbldField/MbldField';
import TimeField from './TimeField/TimeField';

const AttemptField = ({ eventId, ...props }) => {
  if (eventId === '333fm') {
    return <FmField {...props} />;
  }
  if (eventId === '333mbf') {
    return <MbldField {...props} />;
  }
  return <TimeField {...props} />;
};

export default AttemptField;
