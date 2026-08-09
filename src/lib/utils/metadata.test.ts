import { describe, expect, test } from 'vite-plus/test';

import { createToolRouteMetadata } from './metadata';

describe('createToolRouteMetadata', () => {
  test('uses the route-owned metadata for static data and head tags', () => {
    const meta = {
      description: 'Test description',
      pageTitle: 'Test Tool',
      slug: 'test-tool',
    } as const;
    const routeMetadata = createToolRouteMetadata(meta);

    expect(routeMetadata.staticData.meta).toBe(meta);
    expect(routeMetadata.head().links).toEqual([
      { href: 'https://toolbox.sznm.dev/test-tool', rel: 'canonical' },
    ]);
    expect(routeMetadata.head().meta).toEqual([
      { title: 'Test Tool' },
      { content: 'Test description', name: 'description' },
      { content: 'Test Tool', property: 'og:title' },
      { content: 'Test description', property: 'og:description' },
      { content: 'website', property: 'og:type' },
      { content: 'https://toolbox.sznm.dev/test-tool', property: 'og:url' },
      {
        content: 'https://toolbox.sznm.dev/logo512.png',
        property: 'og:image',
      },
      { content: 'Toolbox logo', property: 'og:image:alt' },
      { content: 'summary_large_image', name: 'twitter:card' },
      { content: 'Test Tool', name: 'twitter:title' },
      { content: 'Test description', name: 'twitter:description' },
      {
        content: 'https://toolbox.sznm.dev/logo512.png',
        name: 'twitter:image',
      },
      { content: 'Toolbox logo', name: 'twitter:image:alt' },
    ]);
  });
});
