import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// See: https://create-react-app.dev/docs/making-a-progressive-web-app
serviceWorker.register();
