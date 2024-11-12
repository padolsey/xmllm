export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(streamops|other-esm-modules)/)'
  ],
  moduleFileExtensions: ['js', 'mjs'],
  testRegex: 'tests/.*\\.mjs$',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['./jest.setup.mjs'],
  testTimeout: 30000
}; 