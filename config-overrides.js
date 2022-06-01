const {
  override,
  addLessLoader,
  fixBabelImports,
  adjustStyleLoaders,
} = require("customize-cra");

module.exports = override(
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
    },
  }),
  fixBabelImports("babel-plugin-import", {
    libraryName: "antd",
    style: true,
  }),
  adjustStyleLoaders(({ use: [, , postcss] }) => {
    const postcssOptions = postcss.options;
    postcss.options = { postcssOptions };
  })
);
