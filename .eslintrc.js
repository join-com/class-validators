// Won't be used directly, but imported and extended
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:node/recommended-module',
    'prettier',
  ],
  rules: {
    'node/no-missing-import': [
      'error',
      {
        resolvePaths: [
          './src',
          './node_modules',
          './node_modules/@types',
          './node_modules/@types/node',
        ],
        tryExtensions: ['.ts', '.d.ts'],
      },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
    'sort-imports': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      env: {
        'jest/globals': true,
      },
      rules: {
        'jest/no-disabled-tests': 'error',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/consistent-test-it': 'error',
        'jest/valid-expect': [
          'error',
          {
            alwaysAwait: true,
          },
        ],
      },
    },
  ],
  ignorePatterns: ['.eslintrc.js', 'jest.config.js', 'generated/**/*.ts'],
};
