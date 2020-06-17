const chalk = require("chalk");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodemon = require("nodemon");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const createCompiler = require("./utils/createCompiler");

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

const mainCompiler = createCompiler("Main", require.resolve("../webpack/main.config"));
mainCompiler.watch(
  {
    ...watchOptions,
    ignored: ["preload/**/*"],
  },
  logStats.bind(logStats, "Main")
);

const preloadCompiler = createCompiler("Preload", require.resolve("../webpack/preload.config"));
preloadCompiler.watch(
  {
    ...watchOptions,
    ignored: ["main/**/*"],
  },
  logStats.bind(logStats, "Preload")
);

function launchDevServer() {
  const rendererCompiler = createCompiler(
    "Renderer",
    require.resolve("../webpack/renderer.config")
  );
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
