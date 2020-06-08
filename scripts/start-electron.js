const chalk = require("chalk");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodemon = require("nodemon");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const typescriptIssueFormatter = require("./utils/typescriptIssueFormatter");

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

function logStats(sourceName, err, stats) {
  if (err) {
    console.error(sourceName, err.stack || err);
    if (err.details) {
      console.error(sourceName, err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(sourceName, info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn(sourceName, info.warnings);
  }
}

const watchOptions = {
  "info-verbosity": "none",
};

const mainCompiler = createCompiler("Main", "../webpack/main.config");
mainCompiler.watch(
  {
    ...watchOptions,
    ignored: ["preload/**/*"],
  },
  logStats.bind(logStats, "Main")
);

const preloadCompiler = createCompiler("Preload", "../webpack/preload.config");
preloadCompiler.watch(
  {
    ...watchOptions,
    ignored: ["main/**/*"],
  },
  logStats.bind(logStats, "Preload")
);

function launchDevServer() {
  const rendererCompiler = createCompiler("Renderer", "../webpack/renderer.config");
  const server = new WebpackDevServer(rendererCompiler, {
    port: 3000,
    stats: "errors-warnings",
    hot: true,
    clientLogLevel: "silent",
    quiet: true,
  });
  return new Promise((resolve, reject) => {
    server.listen(3000, "localhost", (error) => {
      if (error) {
        reject(error);
      }

      resolve(server);
    });
  });
}

(async function main() {
  try {
    const server = await launchDevServer();

    // Lanch electron and start watching the built goods
    nodemon({
      exec: "electron ./build/main/main.js",
      watch: ["./build/**/*"],
      ignore: "*.test.*",
      ext: "js,json",
    });

    // When the user cleanly exists then we shutdown, otherwise nodemon will wait
    // for changes and restart.
    nodemon.on("exit", async (reason) => {
      if (!reason) {
        let exitCode = 0;
        console.log("Application shutting down...");
        try {
          await server.close();
        } catch {
          // Error shutting down dev server
          exitCode = -1;
        } finally {
          process.exit(exitCode);
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
})();
