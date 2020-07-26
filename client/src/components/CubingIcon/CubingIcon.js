import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.type === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.54)',
    fontSize: 24,
  },
  iconSmall: {
    fontSize: 16,
  },
}));

function CubingIcon({ eventId, small = false, ...props }) {
  const classes = useStyles();
  return (
    <span
      className={classNames('cubing-icon', `event-${eventId}`, classes.icon, {
        [classes.iconSmall]: small,
      })}
      {...props}
    />
  );
}

export default CubingIcon;
