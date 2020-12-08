const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

const imageAssetsConfig = require("./configs/imageAssetsConfig");
const styleSheetConfig = require("./configs/styleSheetConfig");
const baseConfig = require("./base.config");

const pkg = require("../package.json");

const rendererConfig = (env, options) =>
  merge(
    baseConfig({
      mode: options.mode,
      target: "web",
      outDirectory: "render",
      typescript: {
        reportFiles: ["./src/common/**/*", "./src/render/**/*"],
      },
    }),
    {
      entry: { index: "./src/render/index.tsx" },
      plugins: [
        new HtmlWebpackPlugin({
          title: pkg.productName,
          template: require("html-webpack-template"),
          inject: false,
          appMountId: "root",
        }),
      ],
    },
    styleSheetConfig(env, options),
    imageAssetsConfig(env, options)
  );

module.exports = rendererConfig;
