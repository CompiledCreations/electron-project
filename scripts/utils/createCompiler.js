const chalk = require("chalk");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const webpack = require("webpack");

const typescriptIssueFormatter = require("./typescriptIssueFormatter");

const configFactoryArgs = ["development", { mode: "development" }];

const compilerColors = {
  Main: chalk.black.bgBlue,
  Renderer: chalk.black.bgCyan,
  Preload: chalk.black.bgMagenta,
};

function createCompiler(compilerName, configPath) {
  const configFactory = require(configPath);
  const config = configFactory(...configFactoryArgs);
  const compiler = webpack(config);

  const prefix = compilerColors[compilerName](`[${compilerName}]`);

  logIssue = (issue) => {
    console.log(prefix, typescriptIssueFormatter(issue));
  };

  // "invalid" event fires when you have changed a file, and webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap("invalid", () => {
    console.log(prefix, `Compiling...`);
  });

  let tsMessagesPromise;
  let tsMessagesResolver;
  compiler.hooks.beforeCompile.tap("beforeCompile", () => {
    tsMessagesPromise = new Promise((resolve) => {
      tsMessagesResolver = (msgs) => resolve(msgs);
    });
  });

  ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).receive.tap(
    "afterTypeScriptCheck",
    (diagnostics, lints) => {
      const allMsgs = [...diagnostics, ...lints];
      const errors = allMsgs
        .filter(({ severity }) => severity === "error")
        .map(typescriptIssueFormatter);
      const warnings = allMsgs
        .filter(({ severity }) => severity === "warning")
        .map(typescriptIssueFormatter);
      tsMessagesResolver({
        errors,
        warnings,
      });
    }
  );

  compiler.hooks.done.tap("done", async (stats) => {
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });

    const messages = await tsMessagesPromise;
    statsData.errors.push(...messages.errors);
    statsData.warnings.push(...messages.warnings);

    if (statsData.errors.length) {
      statsData.errors.forEach((message) => {
        console.log(prefix, message);
      });

      console.log(prefix, chalk.red.bold("Failed to compile"));
      return;
    }

    statsData.warnings.forEach((message) => {
      console.log(prefix, message);
    });

    console.log(prefix, chalk.green("Compiled successfully!"));
  });

  return compiler;
}

module.exports = createCompiler;
