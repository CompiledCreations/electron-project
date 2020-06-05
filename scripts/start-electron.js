const nodemon = require("nodemon");

nodemon({
  exec: "npm run start:electron",
  watch: ["./src/main/**/*", "./src/preload/**/*", "./src/common/**/*"],
  ignore: "*.test.*",
  ext: "js,ts,json",
});

// When the user cleanly exists then we shutdown, otherwise nodemon will wait
// for changes and restart.
nodemon.on("exit", (reason) => {
  if (!reason) {
    console.log("Application shutting down...");
    process.exit(0);
  }
});
