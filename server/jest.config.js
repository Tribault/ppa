module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // mongodb-memory-server needs a few seconds to boot on first run
  testTimeout: 20000,
}
