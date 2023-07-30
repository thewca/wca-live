import { useState } from "react";
import { TextField, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function isValidCode(code) {
  return /^\d+-\d{6}$/.test(code);
}

function SignInCodeForm({ onSubmit, disabled = false }) {
  const [code, setCode] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(code);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        variant="outlined"
        label="Code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <IconButton
              type="submit"
              disabled={disabled || !isValidCode(code)}
              size="large"
            >
              <ArrowForwardIcon />
            </IconButton>
          ),
        }}
      />
    </form>
  );
}

export default SignInCodeForm;
