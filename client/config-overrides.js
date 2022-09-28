// Tweaks create-react-app webpack configuration without ejecting it.
// Note: this brings two dependencies: react-app-rewired and customize-cra.

const { override, addBabelPlugins } = require("customize-cra");

module.exports = override(
  // Optimize build times by rewriting grouped @material-ui/core imports
  // into separate imports. This saves some time normally spent on three shaking.
  // See https://mui.com/guides/minimizing-bundle-size/#option-2
  ...addBabelPlugins(
    [
      "babel-plugin-import",
      {
        libraryName: "@mui/material",
        libraryDirectory: "",
        camel2DashComponentName: false,
      },
      "core",
    ],
    [
      "babel-plugin-import",
      {
        libraryName: "@mui/icons-material",
        libraryDirectory: "",
        camel2DashComponentName: false,
      },
      "icons",
    ]
  )
);
