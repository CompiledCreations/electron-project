const chalk = require("chalk");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { SyncHook } = require("tapable");
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

  const logMessage = (message) => {
    const prefix = compilerColors[compilerName](`[${compilerName}]`);
    console.log(prefix, message);
  };

  // Create a custom hook so we can keep track of when the compiler succeeds
  let successCounter = 0;
  compiler.hooks.compilerSuccess = new SyncHook(["count"]);

  // "invalid" event fires when you have changed a file, and webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap("invalid", () => {
    logMessage(`Compiling...`);
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
        logMessage(message);
      });

      logMessage(chalk.red.bold("Failed to compile"));

      // Reset the counter
      successCounter = 0;

      return;
    }

    statsData.warnings.forEach((message) => {
      logMessage(message);
    });

    logMessage(chalk.green("Compiled successfully!"));

    // Increment success counter and emit
    successCounter++;
    compiler.hooks.compilerSuccess.call(successCounter);
  });

  return compiler;
}

module.exports = createCompiler;
