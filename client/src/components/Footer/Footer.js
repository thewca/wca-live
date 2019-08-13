import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  link: {
    '&:hover': {
      textDecoration: 'none',
      opacity: 0.7,
    },
  },
}));

const Footer = () => {
  const classes = useStyles();
  return (
    <Grid container justify="flex-end">
      <Grid item>
        <Grid container spacing={1}>
          <Grid item>
            <Link
              className={classes.link}
              variant="subtitle1"
              component={RouterLink}
              to="/admin"
            >
              Admin
            </Link>
          </Grid>
          <Grid item>
            <Link
              className={classes.link}
              variant="subtitle1"
              href="https://github.com/thewca/wca-live"
              target="_blank"
            >
              GitHub
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Footer;
