import React from 'react';
import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';

const useStyles = makeStyles((theme) => ({
  badge: {
    right: '-1.2em',
    top: 4,
    height: '1.7em',
    minWidth: '2.1em',
    padding: 0,
    borderRadius: 4,
    fontSize: '0.6em',
    fontWeight: 600,
  },
  wr: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  cr: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
  },
  nr: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  pb: {
    color: theme.palette.getContrastText(blue[700]),
    backgroundColor: blue[700],
  },
}));

function ResultWithRecordTag({ result, recordTag, showPb }) {
  const classes = useStyles();

  if (!recordTag || (!showPb && recordTag === 'PB')) {
    return result;
  }

  return (
    <Badge
      badgeContent={recordTag}
      classes={{
        badge: classNames(classes.badge, classes[recordTag.toLowerCase()]),
      }}
    >
      {result}
    </Badge>
  );
}

export default ResultWithRecordTag;
