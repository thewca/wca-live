import "@cubing/icons";
import "./main.css";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App/App";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// See https://create-react-app.dev/docs/making-a-progressive-web-app

// We used to enable SW, so we unregister if one is still installed
unregisterSW();

function unregisterSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
