const nodemon = require("nodemon");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const configFactoryArgs = ["development", { mode: "development" }];

function createCompiler(configPath) {
  const configFactory = require(configPath);
  const config = configFactory(...configFactoryArgs);
  const compiler = webpack(config);
  return compiler;
}

function logStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
}

const watchOptions = {
  "info-verbosity": "none",
};

const mainCompiler = createCompiler("../webpack/main.config");
mainCompiler.watch(
  {
    ...watchOptions,
    ignored: ["preload/**/*"],
  },
  logStats
);

const preloadCompiler = createCompiler("../webpack/preload.config");
preloadCompiler.watch(
  {
    ...watchOptions,
    ignored: ["main/**/*"],
  },
  logStats
);

function launchDevServer() {
  const rendererCompiler = createCompiler("../webpack/renderer.config");
  const server = new WebpackDevServer(rendererCompiler, {
    port: 3000,
    stats: "errors-warnings",
    hot: true,
    overlay: true,
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
