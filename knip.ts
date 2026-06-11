import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['src/lib/components/ui/**/*', 'src/lib/hooks/use-clipboard.ts'],
  project: ['src/**/*.{ts,tsx,js,jsx,css}'],
};

export default config;
