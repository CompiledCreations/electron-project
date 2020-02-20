const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

const styleSheetConfig = require("./configs/styleSheetConfig");
const baseConfig = require("./base.config");

const rendererConfig = (env, options) =>
  merge(
    baseConfig({
      mode: options.mode,
      target: "web",
      outDirectory: "render",
      typescript: {
        reportFiles: ["./src/common/**/*", "./src/render/**/*"]
      }
    }),
    {
      entry: { index: "./src/render/index.tsx" },
      plugins: [
        new HtmlWebpackPlugin({
          title: "My Project",
          template: require("html-webpack-template"),
          inject: false,
          appMountId: "root"
        })
      ],
      devServer: {
        port: 3000
      }
    },
    styleSheetConfig(env, options)
  );

module.exports = rendererConfig;
