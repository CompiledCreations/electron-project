module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest", "react-hooks", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:react/recommended",
    "plugin:jest/all",
    "prettier/@typescript-eslint",
  ],
  settings: {
    react: {
      version: "detect",
    },
    // Setup import resolver with module aliases
    "import/resolver": {
      alias: {
        map: [
          ["@common", "./src/common"],
          ["@main", "./src/main"],
          ["@preload", "./src/preload"],
          ["@render", "./src/render"],
        ],
        extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"],
      },
    },
  },
  env: {
    browser: true,
    "jest/globals": true,
    node: true,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jest/prefer-expect-assertions": "off",
    "jest/require-top-level-describe": "off",
  },
};
