const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const merge = require("webpack-merge");

const baseConfig = require("./base.config");

module.exports = merge(baseConfig("web", "render"), {
  entry: { index: "./src/render/index.js" },
  plugins: [
    new CleanWebpackPlugin(),
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
});
