/** @type {import('@commitlint/types').UserConfig} */
const CommitLintConfiguration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-enum': [
      2,
      'always',
      ['components', 'layout', 'routes', 'styles', 'utils', 'hooks', 'deps'],
    ],
  },
};

export default CommitLintConfiguration;
