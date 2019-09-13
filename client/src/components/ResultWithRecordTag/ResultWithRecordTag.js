import React from 'react';
import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  badge: {
    right: '-1.3em',
    top: 4,
    height: '1.7em',
    minWidth: '2.1em',
    padding: 0,
    borderRadius: 4,
    fontSize: '0.6em',
  },
}));

const ResultWithRecordTag = ({ result, recordTag, showPb }) => {
  const classes = useStyles();

  if (!recordTag || (!showPb && recordTag === 'PB')) {
    return result;
  }

  return (
    <Badge
      color="primary"
      badgeContent={recordTag}
      classes={{ badge: classes.badge }}
    >
      {result}
    </Badge>
  );
};

export default ResultWithRecordTag;
