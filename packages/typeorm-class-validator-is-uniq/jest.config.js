module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: 'jest-extended',
  testPathIgnorePatterns: ['/node_modules/'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
