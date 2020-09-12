// Tweaks create-react-app webpack configuration without ejecting it.
// Note: this brings two dependencies: react-app-rewired and customize-cra.

const { override, adjustWorkbox, addBabelPlugins } = require('customize-cra');

module.exports = override(
  // Optimize build times by rewriting grouped @material-ui/core imports
  // into separate imports. This saves some time normally spent on three shaking.
  // See https://material-ui.com/guides/minimizing-bundle-size/#option-2
  ...addBabelPlugins(
    [
      'babel-plugin-import',
      {
        'libraryName': '@material-ui/core',
        'libraryDirectory': 'esm',
        'camel2DashComponentName': false
      },
      'core'
    ],
    [
      'babel-plugin-import',
      {
        'libraryName': '@material-ui/icons',
        'libraryDirectory': 'esm',
        'camel2DashComponentName': false
      },
      'icons'
    ],
    [
      'babel-plugin-import',
      {
        'libraryName': '@material-ui/lab',
        'libraryDirectory': 'esm',
        'camel2DashComponentName': false
      },
      'lab'
    ]
  ),
  // Override Workbox default configuration.
  // Specifically we don't want service worker to return cached index.html
  // for /oauth and /pdfs routes as those are not part of our SPA.
  // Once CRA supports custom Workbox config (https://github.com/facebook/create-react-app/pull/5369)
  // we can remove this and use the provided solution.
  adjustWorkbox(wb => {
    // See https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generateSW-navigateFallbackBlacklist
    wb.navigateFallbackBlacklist.push(/^\/oauth/, /^\/pdfs/);
  })
);
