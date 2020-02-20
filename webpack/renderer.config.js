const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

const baseConfig = require("./base.config");

const rendererConfig = (env, { mode }) =>
  merge(
    baseConfig({
      mode,
      target: "web",
      outDirectory: "render",
      typescript: {
        reportFiles: ["./src/common/**/*", "./src/render/**/*"]
      }
    }),
    {
      entry: { index: "./src/render/index.ts" },
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
    }
  );

module.exports = rendererConfig;
