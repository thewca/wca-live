import { Box } from "@mui/material";
import { red, yellow, green, blue, grey } from "@mui/material/colors";

const styles = {
  wr: {
    color: (theme) => theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  cr: {
    color: (theme) => theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
  },
  nr: {
    color: (theme) => theme.palette.getContrastText(green["A400"]),
    backgroundColor: green["A400"],
  },
  pr: {
    color: (theme) => theme.palette.getContrastText(blue[700]),
    backgroundColor: blue[700],
  },
  litePr: {
    color: (theme) =>
      theme.palette.getContrastText(
        theme.palette.mode === "dark" ? grey[800] : grey[200],
      ),
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? grey[800] : grey[200],
  },
};

function RecordTag({ recordTag, sx, litePr = false }) {
  const tagStyle =
    litePr && recordTag === "PR"
      ? styles.litePr
      : styles[recordTag.toLowerCase()] || {};

  return (
    <Box
      component="span"
      sx={{
        display: "block",
        lineHeight: 1,
        py: 0.8,
        px: 1,
        borderRadius: 1,
        fontWeight: 600,
        fontSize: "0.7em",
        ...sx,
        ...tagStyle,
      }}
    >
      {recordTag}
    </Box>
  );
}

export default RecordTag;
