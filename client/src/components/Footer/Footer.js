import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';

import { useToggleTheme } from '../ThemeProvider/ThemeProvider';

const useStyles = makeStyles((theme) => ({
  link: {
    '&:hover': {
      textDecoration: 'none',
      opacity: 0.7,
    },
  },
  grow: {
    flexGrow: 1,
  },
}));

function Footer() {
  const classes = useStyles();
  const theme = useTheme();
  const toggleTheme = useToggleTheme();

  return (
    <Grid container spacing={1}>
      <Grid item>
        <IconButton
          size="small"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme.palette.type === 'dark' ? (
            <EmojiObjectsIcon />
          ) : (
            <EmojiObjectsOutlinedIcon />
          )}
        </IconButton>
      </Grid>
      <Grid item className={classes.grow} />
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
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </Grid>
    </Grid>
  );
}

export default Footer;
