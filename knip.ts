import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Registry-managed IntentUI components and their dependencies are kept for
  // future tools; unused application files and dependencies still fail.
  ignore: ['src/lib/components/ui/**', 'src/lib/hooks/use-clipboard.ts'],
  // Invoked by .vite-hooks/commit-msg, which static analysis cannot see.
  ignoreDependencies: [
    '@commitlint/cli',
    '@internationalized/date',
    'embla-carousel-react',
    'input-otp',
    'recharts',
  ],
  project: ['src/**/*.{ts,tsx,js,jsx,css}', 'content/**/*.mdx'],
  // IntentUI primitives under src/lib/components/ui are regenerable via the
  // shadcn CLI and their remaining exports are intentional surface, so
  // export/type pruning is disabled instead of failing the check.
  rules: {
    exports: 'off',
    types: 'off',
  },
};

export default config;
