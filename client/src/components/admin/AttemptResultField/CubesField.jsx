import { useState } from "react";
import { TextField } from "@mui/material";
import { toInt } from "../../../lib/utils";

function numberToInput(number) {
  if (number === 0) return "";
  return number.toString();
}

function CubesField({ value, onChange, label, disabled, TextFieldProps = {} }) {
  const [prevValue, setPrevValue] = useState(value);
  const [draftValue, setDraftValue] = useState(value);

  // Sync draft value when the upstream value changes. See AttemptResultField for detailed description.
  if (prevValue !== value) {
    setDraftValue(value);
    setPrevValue(value);
  }

  function handleChange(event) {
    const newValue = toInt(event.target.value.replace(/\D/g, "")) || 0;
    if (newValue <= 99) {
      setDraftValue(newValue);
    }
  }

  function handleBlur() {
    onChange(draftValue);
    // Once we emit the change, reflect the initial state.
    setDraftValue(value);
  }

  return (
    <TextField
      {...TextFieldProps}
      type="tel"
      label={label}
      disabled={disabled}
      spellCheck={false}
      value={numberToInput(draftValue)}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

export default CubesField;
