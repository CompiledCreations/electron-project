const merge = require("webpack-merge");

const baseConfig = require("./base.config");

const preloadConfig = (env, { mode }) =>
  merge(
    baseConfig({
      mode,
      target: "electron-preload",
      outDirectory: "preload",
      typescript: { reportFiles: ["./src/common/**/*", "./src/preload/**/*"] }
    }),
    {
      entry: { preload: "./src/preload/preload.ts" }
    }
  );

module.exports = preloadConfig;
