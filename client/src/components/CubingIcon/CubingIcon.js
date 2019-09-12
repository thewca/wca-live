import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.type === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.54)',
    fontSize: 24,
  },
}));

const CubingIcon = ({ eventId, ...props }) => {
  const classes = useStyles();
  return (
    <span
      className={classNames('cubing-icon', `event-${eventId}`, classes.icon)}
      {...props}
    />
  );
};

export default CubingIcon;
