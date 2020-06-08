const chalk = require("chalk");

const originNames = {
  eslint: "ESLint",
  internal: "fork-ts-checker-webpack-plugin",
  typescript: "TypeScript",
};

function formatter(issue) {
  const { origin, severity, message, file, line, character, code } = issue;

  const messageColor = severity === "warning" ? chalk.yellow : chalk.red;
  const codePrefix = origin === "typescript" ? "TS" : "";

  const formatted = `${messageColor.bold(`${originNames[origin]} ${severity} in `)}${chalk.cyan(
    `${file}(${line},${character})`
  )}${messageColor(":")} ${message}  ${messageColor.underline(`${codePrefix}${code}`)}`;

  return formatted;
}

module.exports = formatter;
