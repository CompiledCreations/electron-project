const path = require("path");

const outputPath = path.resolve("build");

const baseConfig = (target, outDirectory) => ({
  target,
  output: {
    filename: "[name].js",
    path: path.join(outputPath, outDirectory)
  }
});

module.exports = baseConfig;
