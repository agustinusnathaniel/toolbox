import { resolve } from 'node:path';
import { generateSW } from 'workbox-build';

// vite-plugin-pwa's `closeBundle` hook never sees the client build in the
// TanStack Start + vite-plus flow (its shared plugin context ends up pointing
// at the SSR build), so sw.js can't be emitted there. Same as the cartrack
// reference project, we generate the service worker in a dedicated post-build
// step instead. VitePWA still emits the manifest + icons + register module.
const outDir = resolve(import.meta.dirname, '../dist/client');

const { count, size, filePaths } = await generateSW({
  cleanupOutdatedCaches: true,
  globDirectory: outDir,
  globIgnores: ['**/js-perf.worker-**'],
  globPatterns: ['**/*.{js,css,html,woff2,ico,png,svg,jpeg,jpg}'],
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/api\//, /^\/_serverFn\//],
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
      urlPattern: /\.wasm$/i,
    },
  ],
  swDest: resolve(outDir, 'sw.js'),
});

console.log(
  `\n  SW generated: ${filePaths.join(', ')} (${(size / 1024).toFixed(1)} kB, ${count} precache entries)\n`
);
