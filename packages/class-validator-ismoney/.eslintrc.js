const baseConfig = require('../../.eslintrc.js')

module.exports = {
  ...baseConfig,
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './src/__tests__/tsconfig.json'],
  },
}
