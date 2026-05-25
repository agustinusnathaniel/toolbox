import { ValidateEnv } from '@julr/vite-plugin-validate-env';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools as tanstackDevtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite-plus';

const pwaOptions: Partial<VitePWAOptions> = {
  disable: true,
  registerType: 'autoUpdate',
  base: '/',
  manifest: {
    short_name: 'Tools',
    name: 'Toolbox — Unified Utility Platform',
    theme_color: '#000000',
    lang: 'en',
    start_url: '/',
    background_color: '#FFFFFF',
    dir: 'ltr',
    display: 'standalone',
    prefer_related_applications: false,
  },
  pwaAssets: {
    disabled: false,
    config: true,
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isCheckDisabled = mode === 'production' || !!process.env.VITEST;
  const env = loadEnv(mode, process.cwd(), '');
  const isReactCompilerEnabled = env.ENABLE_PLUGIN_REACT_COMPILER === 'true';

  return {
    staged: {
      'src/**/*.{js,jsx,ts,tsx,json,css,scss,md}': ['ultracite fix'],
      '*.{ts,js,json,md}': ['ultracite fix'],
    },
    plugins: [
      ValidateEnv(),
      tanstackDevtools(),
      tanstackRouter({ autoCodeSplitting: true }),
      react(),
      ...(isReactCompilerEnabled
        ? [
            babel({
              presets: [reactCompilerPreset()],
            }),
          ]
        : []),
      tailwindcss(),
      ...(isCheckDisabled
        ? []
        : [
            checker({
              typescript: true,
            }),
          ]),
      VitePWA(pwaOptions),
    ],
    server: {
      open: true,
    },
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/lib/test-setup.ts'],
      coverage: {
        include: ['src/**/**.{ts,tsx,js,jsx}'],
      },
    },
  };
});
