const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, { mode }) => {
  const plugins = [];

  // Extract CSS assets for production builds
  if (mode !== "development") {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: "[name].[hash].css",
        chunkFilename: "[id].[hash].css"
      })
    );
  }

  return {
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            mode === "development"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
          ]
        }
      ]
    },
    plugins
  };
};
