import { Link as RouterLink } from "react-router-dom";
import { Grid, Link, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import { useToggleTheme } from "../ThemeProvider/ThemeProvider";

const linkStyles = {
  "&:hover": {
    opacity: 0.7,
  },
};

function HomeFooter() {
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
          {theme.palette.mode === "dark" ? (
            <EmojiObjectsIcon />
          ) : (
            <EmojiObjectsOutlinedIcon />
          )}
        </IconButton>
      </Grid>
      <Grid item sx={{ flexGrow: 1 }} />
      <Grid item>
        <Link
          sx={linkStyles}
          variant="subtitle1"
          component={RouterLink}
          to="/about"
          underline="none"
        >
          About
        </Link>
      </Grid>
      <Grid item>
        <Link
          sx={linkStyles}
          variant="subtitle1"
          href="https://github.com/thewca/wca-live"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          GitHub
        </Link>
      </Grid>
    </Grid>
  );
}

export default HomeFooter;
