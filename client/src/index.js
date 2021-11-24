import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { register } from './service-worker-registration';

import { maybeGrabTokenFromUrl } from './lib/auth';

maybeGrabTokenFromUrl();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// See https://create-react-app.dev/docs/making-a-progressive-web-app
register();
