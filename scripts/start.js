const chalk = require("chalk");
const nodemon = require("nodemon");
const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");

const createCompiler = require("./utils/createCompiler");

/**
 * Custom logging for webpack watch
 *
 * @param {string} sourceName
 * @param {Error} err
 * @param {webpack.stats} stats
 */
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

/**
 * Start the electron process and shut everything down when the user quits
 */
function startElectron(server) {
  // Launch electron without watching files
  let electronProcess = nodemon({
    exec: "electron ./build/main/main.js",
    ignore: "*",
    args: process.argv,
  });

  // When the user cleanly exists then we shutdown, otherwise nodemon will wait
  // for changes and restart.
  electronProcess.on("exit", async (reason) => {
    if (!reason) {
      let exitCode = 0;
      console.log(chalk.blue.inverse("[Main]"), "Application shutting down...");
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

  return electronProcess;
}

/**
 * Create the Renderer compiler and launch webpack-dev-server with it
 *
 * @returns Webpack dev server
 */
function startDevServer() {
  const rendererCompiler = createCompiler(
    "Renderer",
    require.resolve("../webpack/renderer.config")
  );

  const newServer = new WebpackDevServer(rendererCompiler, {
    port: 3000,
    stats: "errors-warnings",
    hot: true,
    clientLogLevel: "silent",
    quiet: true,
  });

  return new Promise((resolve, reject) => {
    newServer.listen(3000, "localhost", (error) => {
      if (error) {
        reject(error);
      }

      resolve(newServer);
    });
  });
}

/**
 * Start the main electron process with compilers in watch mode
 *
 * @param {WebpackDevServer} server The server hosting the renderer
 */
function startMainProcess(server) {
  let electronProcess;
  const counts = {};

  // Start the Electron when both compilers first succeed. Restart on any success after that.
  function handleCompilerSuccess() {
    if (counts.Main && counts.Preload) {
      if (electronProcess) {
        electronProcess.restart();
      } else {
        electronProcess = startElectron(server);
      }
    }
  }

  // Create the compiler and start watching
  function spawnCompiler(name, configPath, ignored) {
    // Create the compiler and start listening
    const preloadCompiler = createCompiler(name, require.resolve(configPath));
    preloadCompiler.hooks.compilerSuccess.tap("CompilerSuccess", (count) => {
      counts[name] = count;
      handleCompilerSuccess();
    });

    // Start the compiler in watch mode
    preloadCompiler.watch(
      {
        "info-verbosity": "none",
        ignored,
      },
      logStats.bind(logStats, name)
    );
  }

  spawnCompiler("Main", "../webpack/main.config", ["preload/**/*"]);
  spawnCompiler("Preload", "../webpack/preload.config", ["main/**/*"]);
}

(async function main() {
  try {
    const server = await startDevServer();
    startMainProcess(server);
  } catch (error) {
    console.log(chalk.red.inverse(error));
  }
})();
