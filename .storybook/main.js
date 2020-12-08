const merge = require("webpack-merge");
const path = require("path");

const styleSheetConfig = require("../webpack/configs/styleSheetConfig");

module.exports = {
  stories: ["../stories/**/*.stories.tsx", "../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-actions", "@storybook/addon-links"],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve("ts-loader"),
        },
        // Optional
        {
          loader: require.resolve("react-docgen-typescript-loader"),
        },
      ],
    });
    config.resolve.extensions.push(".ts", ".tsx");

    // Replace existing CSS rule and add one with module support
    const cssRuleIndex = config.module.rules.findIndex(
      (rule) => String(rule.test).indexOf("css") !== -1
    );
    if (cssRuleIndex !== -1) {
      config.module.rules.splice(cssRuleIndex, 1);
    }

    config = merge(config, styleSheetConfig(process.env, { mode: config.mode }));

    return config;
  },
};
