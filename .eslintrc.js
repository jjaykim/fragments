module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    'global-require': 'off',
    'no-undef': 'off',
    'func-names': 'off',
    'arrow-body-style': 'off',
    'no-use-before-define': 'off',
  },
};
