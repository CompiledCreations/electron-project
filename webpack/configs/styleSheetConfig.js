const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, { mode }) => {
  // Use style-loader during development for speed
  let assetLoader = MiniCssExtractPlugin.loader;
  if (mode === "development") {
    assetLoader = "style-loader";
  }

  // Shared options for css-loader
  const cssLoaderOptions = {
    importLoaders: 1,
  };

  return {
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [assetLoader, { loader: "css-loader", options: cssLoaderOptions }, "sass-loader"],
          exclude: /\.module\.(sa|sc|c)ss$/,
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            assetLoader,
            {
              loader: "css-loader",
              options: {
                ...cssLoaderOptions,
                modules: {
                  localIdentName: "[local]__[hash:base64:5]",
                },
              },
            },
            "sass-loader",
          ],
          include: /\.module\.(sa|sc|c)ss$/,
        },
      ],
    },
    plugins: [
      // Extract CSS assets for production builds
      mode !== "development" &&
        new MiniCssExtractPlugin({
          filename: "[name].[hash].css",
          chunkFilename: "[id].[hash].css",
        }),
    ].filter(Boolean),
  };
};
