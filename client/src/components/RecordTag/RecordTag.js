import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';

const useStyles = makeStyles(theme => ({
  recordTag: {
    display: 'block',
    padding: theme.spacing(0.5, 1),
    borderRadius: 4,
    fontWeight: 600,
    fontSize: '0.8em',
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

const RecordTag = ({ recordTag }) => {
  const classes = useStyles();
  return (
    <span
      className={classNames(
        classes.recordTag,
        classes[recordTag.toLowerCase()]
      )}
    >
      {recordTag}
    </span>
  );
};

export default RecordTag;
