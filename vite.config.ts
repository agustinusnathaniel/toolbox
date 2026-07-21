import { ValidateEnv } from '@julr/vite-plugin-validate-env';
import mdx from '@mdx-js/rollup';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools as tanstackDevtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';

const WASM_URL_PATTERN = /\.wasm$/i;
const WORKER_GLOB_IGNORE = ['**/js-perf.worker-**'];

const pwaOptions = (mode: string): Partial<VitePWAOptions> => ({
  base: '/',
  disable: mode !== 'production',
  includeAssets: [
    'favicon.ico',
    'apple-touch-icon-180x180.png',
    'maskable-icon-512x512.png',
  ],
  manifest: {
    background_color: '#FFFFFF',
    categories: ['developer tools', 'utilities', 'productivity'],
    description:
      'A unified toolkit for developers — JSON tools, text utilities, JS benchmarking, and more.',
    dir: 'ltr',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    id: '/',
    lang: 'en',
    name: 'Toolbox — Unified Utility Platform',
    prefer_related_applications: false,
    short_name: 'Tools',
    start_url: '/',
    theme_color: '#000000',
  },
  pwaAssets: {
    config: true,
    disabled: false,
  },
  registerType: 'prompt',
  workbox: {
    cleanupOutdatedCaches: true,
    globIgnores: WORKER_GLOB_IGNORE,
    globPatterns: ['**/*.{js,css,html,woff2,ico,png,svg,jpeg,jpg}'],
    runtimeCaching: [
      {
        handler: 'NetworkFirst',
        options: {
          cacheName: 'wasm-files',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 7,
            maxEntries: 10,
          },
        },
        urlPattern: WASM_URL_PATTERN,
      },
    ],
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isCheckDisabled = mode === 'production' || !!process.env.VITEST;
  const env = loadEnv(mode, process.cwd(), '');
  const isReactCompilerEnabled = env.ENABLE_PLUGIN_REACT_COMPILER === 'true';

  return {
    fmt: {
      // disable vp fmt
      ignorePatterns: ['**/*'],
      singleQuote: true,
    },
    lint: {
      // disable vp check
      ignorePatterns: ['**/*'],
      options: { typeAware: true, typeCheck: true },
    },
    plugins: lazyPlugins(() => [
      ValidateEnv(),
      tanstackDevtools(),
      tanstackRouter({ autoCodeSplitting: true }),
      mdx({ include: ['content/**/*.mdx'] }),
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
      VitePWA(pwaOptions(mode)),
    ]),
    resolve: {
      tsconfigPaths: true,
    },
    staged: {
      '*.{js,jsx,ts,tsx,json,jsonc,css,scss,md,mdx}': ['ultracite fix'],
    },
    test: {
      coverage: {
        exclude: [
          '**/*.test.*',
          '**/*.spec.*',
          '**/routeTree.gen.ts',
          'src/main.tsx',
          'src/env.d.ts',
        ],
        include: ['src/**/**.{ts,tsx,js,jsx}'],
      },
      environment: 'jsdom',
      setupFiles: ['./src/lib/test-setup.ts'],
    },
  };
});
