module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/standard',
  ],
  plugins: ['@typescript-eslint', 'jest'],
  rules: {
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // project: [
    //   './tsconfig.eslint.json'
    // ],
    // tsconfigRootDir: __dirname,
    // debugLevel: true
  },
};
