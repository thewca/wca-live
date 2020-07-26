/* Note: this brings in two dependencies: react-app-rewired and customize-cra.
   We use it to override Workbox default configuration,
   specifically we don't want service worker to return cached index.html
   for /oauth and /pdfs routes as those are not part of our SPA.
   Once CRA supports custom Workbox config (https://github.com/facebook/create-react-app/pull/5369)
   we can get rid of this file, the two dependencies and change package.json scripts
   to use react-scripts instead of react-app-rewired again. */

const { override, adjustWorkbox } = require('customize-cra');

module.exports = override(
  adjustWorkbox(wb => {
    /* See https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generateSW-navigateFallbackBlacklist */
    wb.navigateFallbackBlacklist.push(/^\/oauth/, /^\/pdfs/);
  })
);
