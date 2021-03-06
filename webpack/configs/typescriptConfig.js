const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const typescriptIssueFormatter = require("../../scripts/utils/typescriptIssueFormatter");

module.exports = ({ compilerOptions, reportFiles }) => {
  return {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            { loader: "cache-loader" },
            {
              loader: "ts-loader",
              options: {
                happyPackMode: true,
                transpileOnly: true,
                onlyCompileBundledFiles: true,
                compilerOptions,
                errorFormatter: typescriptIssueFormatter,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        compilerOptions,
        checkSyntacticErrors: true,
        reportFiles,
        eslint: true,
        silent: true,
      }),
    ],
  };
};
