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
  disable: mode !== 'production',
  registerType: 'prompt',
  base: '/',
  includeAssets: [
    'favicon.ico',
    'apple-touch-icon-180x180.png',
    'maskable-icon-512x512.png',
  ],
  manifest: {
    id: '/',
    short_name: 'Tools',
    name: 'Toolbox — Unified Utility Platform',
    description:
      'A unified toolkit for developers — JSON tools, text utilities, JS benchmarking, and more.',
    theme_color: '#000000',
    lang: 'en',
    start_url: '/',
    background_color: '#FFFFFF',
    dir: 'ltr',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    prefer_related_applications: false,
    categories: ['developer tools', 'utilities', 'productivity'],
  },
  pwaAssets: {
    disabled: false,
    config: true,
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,ico,png,svg,jpeg,jpg}'],
    cleanupOutdatedCaches: true,
    globIgnores: WORKER_GLOB_IGNORE,
    runtimeCaching: [
      {
        urlPattern: WASM_URL_PATTERN,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'wasm-files',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
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
    lint: {
      options: { typeAware: true, typeCheck: true },
      // disable vp check
      ignorePatterns: ['**/*'],
    },
    fmt: {
      singleQuote: true,
      // disable vp fmt
      ignorePatterns: ['**/*'],
    },
    staged: {
      '*.{js,jsx,ts,tsx,json,jsonc,css,scss,md,mdx}': ['ultracite fix'],
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
        exclude: [
          '**/*.test.*',
          '**/*.spec.*',
          '**/routeTree.gen.ts',
          'src/main.tsx',
          'src/env.d.ts',
        ],
      },
    },
  };
});
