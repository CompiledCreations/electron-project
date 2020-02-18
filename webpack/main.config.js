const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const merge = require("webpack-merge");
const { DefinePlugin } = require("webpack");

const baseConfig = require("./base.config");

const mainConfig = (env, options) =>
  merge(baseConfig("electron-main", "main"), {
    entry: { main: "./src/main/main.js" },
    plugins: [
      new CleanWebpackPlugin(),
      new DefinePlugin({
        INDEX_URL:
          options.mode === "development"
            ? JSON.stringify("http://localhost:3000")
            : `require('url').format({ protocol: "file", slashes: true, pathname: require('path').join(__dirname, "..", "render", "index.html") })`
      })
    ]
  });

const preloadConfig = merge(baseConfig("electron-preload", "main"), {
  entry: { preload: "./src/main/preload.js" }
});

module.exports = [mainConfig, preloadConfig];
