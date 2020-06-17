const chalk = require("chalk");

const originNames = {
  eslint: "ESLint",
  internal: "fork-ts-checker-webpack-plugin",
  typescript: "TypeScript",
};

/**
 * Format messages from different sources in a consistent manner
 *
 * @param issue Issue data from fork-ts-checker-webpack-plugin or ts-loader
 * @returns Formatted message string
 */
function formatter(issue) {
  // Conditionally unpack stuff that varies between plugins/loaders
  const message = issue.message || issue.content;
  const origin = issue.origin || "typescript";
  const { severity, file, line, character, code } = issue;

  const messageColor = severity === "warning" ? chalk.yellow : chalk.red;
  const codePrefix = origin === "typescript" ? "TS" : "";

  const formatted = `${messageColor.bold(`${originNames[origin]} ${severity} in `)}${chalk.cyan(
    `${file}(${line},${character})`
  )}${messageColor(":")} ${message}  ${messageColor.underline(`${codePrefix}${code}`)}`;

  return formatted;
}

module.exports = formatter;
