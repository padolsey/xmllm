module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(p-queue|eventemitter3|p-timeout)/)',  // Add any other modules that need transformation
  ],
};
