module.exports = {
  testTimeout: 30000,
  setupFiles: ['dotenv/config'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/Infrastructures/container.js',
  ],
};
