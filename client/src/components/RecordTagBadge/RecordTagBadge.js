import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import RecordTag from '../RecordTag/RecordTag';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(110%, -40%)',
    fontSize: '0.6em',
    padding: '0.14em 0.4em',
  },
}));

function RecordTagBadge({ recordTag, hidePb = false, children }) {
  const classes = useStyles();

  if (!recordTag || (hidePb && recordTag === 'PB')) {
    return children;
  }

  return (
    <span className={classes.root}>
      {children}
      <RecordTag
        recordTag={recordTag}
        className={classNames(classes.badge, classes[recordTag.toLowerCase()])}
      />
    </span>
  );
}

export default RecordTagBadge;
