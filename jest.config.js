// Configuration to share across the different projects
const baseConfig = {
  preset: "ts-jest"
};

// Setup separate test projects for test that run in browser and those that run in node
module.exports = {
  projects: [
    {
      ...baseConfig,
      roots: ["<rootDir>/src/render"],
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
          "<rootDir>/src/__mocks__/fileMock.js",
        "\\.(css|less|sass|scss)$": "identity-obj-proxy"
      }
    },
    {
      ...baseConfig,
      roots: [
        "<rootDir>/src/common",
        "<rootDir>/src/main",
        "<rootDir>/src/preload"
      ],
      testEnvironment: "node"
    }
  ]
};
