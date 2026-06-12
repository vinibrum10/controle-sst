module.exports = {
  testEnvironment: "node",
  rootDir: __dirname,
  testMatch: ["<rootDir>/server/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/server/tests/env.js"],
  globalSetup: "<rootDir>/server/tests/globalSetup.js",
  maxWorkers: 1,
  testTimeout: 30000
};
