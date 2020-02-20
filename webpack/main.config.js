const merge = require("webpack-merge");
const { DefinePlugin } = require("webpack");

const baseConfig = require("./base.config");

const mainConfig = (env, { mode }) =>
  merge(
    baseConfig({
      mode,
      target: "electron-main",
      outDirectory: "main",
      typescript: {
        reportFiles: [
          "./src/common/**/*",
          "./src/main/**/*",
          "!./src/main/preload.ts"
        ]
      }
    }),
    {
      entry: { main: "./src/main/main.ts" },
      plugins: [
        new DefinePlugin({
          INDEX_URL:
            mode === "development"
              ? JSON.stringify("http://localhost:3000")
              : `require('url').format({ protocol: "file", slashes: true, pathname: require('path').join(__dirname, "..", "render", "index.html") })`
        })
      ],
      node: {
        __dirname: false,
        __filename: false
      }
    }
  );

module.exports = mainConfig;
