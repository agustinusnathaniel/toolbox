import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Invoked by .vite-hooks/commit-msg, which static analysis cannot see.
  ignoreDependencies: ['@commitlint/cli'],
  project: ['src/**/*.{ts,tsx,js,jsx,css}', 'content/**/*.mdx'],
  // Unused files and dependencies are the enforced invariants. IntentUI
  // primitives under src/lib/components/ui are regenerable via the shadcn CLI
  // and their remaining exports are intentional surface, so export/type
  // pruning is disabled instead of failing the check.
  rules: {
    exports: 'off',
    types: 'off',
  },
};

export default config;
