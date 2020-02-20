const main = require("./webpack/main.config");
const preload = require("./webpack/preload.config");
const renderer = require("./webpack/renderer.config");

module.exports = [main, preload, renderer];
