const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const merge = require("webpack-merge");

const typescriptConfig = require("./configs/typescriptConfig");

const outputPath = path.resolve("build");

const baseConfig = ({ mode, target, outDirectory, typescript }) =>
  merge(
    {
      mode,
      devtool: mode === "development" ? "inline-source-map" : "source-map",
      target,
      output: {
        filename: "[name].js",
        path: path.join(outputPath, outDirectory),
      },
      resolve: {
        extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"],
      },
      plugins: [new CleanWebpackPlugin()],
    },
    typescriptConfig(typescript)
  );

module.exports = baseConfig;
