// Inline images < 8kb as base64 data URLs, larger images will be output to files with a generated
// public URL.
module.exports = (env, options) => ({
  module: {
    rules: [
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
              name: "images/[name].[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
});
