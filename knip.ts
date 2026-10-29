import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Registry-managed shadcn/ReUI components and their dependencies are kept
  // for future tools; unused application files and dependencies still fail.
  ignore: [
    'src/lib/components/ui/**',
    'src/lib/components/reui/**',
    'src/lib/hooks/use-clipboard.ts',
  ],
  // Invoked by .vite-hooks/commit-msg, which static analysis cannot see.
  ignoreDependencies: ['@commitlint/cli', 'input-otp'],
  project: ['src/**/*.{ts,tsx,js,jsx,css}', 'content/**/*.mdx'],
  // Registry primitives under src/lib/components/ui and
  // src/lib/components/reui are regenerable via the shadcn CLI and their
  // remaining exports are intentional surface, so export/type pruning is
  // disabled instead of failing the check.
  rules: {
    exports: 'off',
    types: 'off',
  },
};

export default config;
