import 'react-app-polyfill/stable';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App/App';
import { unregister } from './service-worker-registration';

import { maybeGrabTokenFromUrl } from './lib/auth';

maybeGrabTokenFromUrl();

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// See https://create-react-app.dev/docs/making-a-progressive-web-app
unregister();
