import React from "react";

import "flag-icons/css/flag-icons.min.css";
import "./FlagIcon.css";

function FlagIcon({ code, size }) {
  return (
    <span className={`fi fi-${code} ${size ? `fi-size-${size}` : ""}`}></span>
  );
}

export default FlagIcon;
