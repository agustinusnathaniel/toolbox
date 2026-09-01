import { describe, expect, test } from 'vite-plus/test';

import { createToolRouteMetadata } from './metadata';

describe('createToolRouteMetadata', () => {
  test('propagates route-owned metadata into static data, canonical URL, and key head tags', () => {
    const meta = {
      description: 'Test description',
      pageTitle: 'Test Tool',
      slug: 'test-tool',
    } as const;
    const routeMetadata = createToolRouteMetadata(meta);
    const { links, meta: headMeta } = routeMetadata.head();

    expect(routeMetadata.staticData.meta).toBe(meta);

    expect(links).toEqual([
      { href: 'https://toolbox.sznm.dev/test-tool', rel: 'canonical' },
    ]);

    const contentFor = (key: string) =>
      headMeta
        .filter(
          (tag) =>
            'content' in tag &&
            (('name' in tag && tag.name === key) ||
              ('property' in tag && tag.property === key))
        )
        .map((tag) => ('content' in tag ? tag.content : ''));

    expect(contentFor('og:title')).toEqual(['Test Tool']);
    expect(contentFor('og:description')).toEqual(['Test description']);
    expect(contentFor('og:url')).toEqual([
      'https://toolbox.sznm.dev/test-tool',
    ]);
    expect(headMeta).toContainEqual({ title: 'Test Tool' });
    expect(headMeta).toContainEqual({
      content: 'Test description',
      name: 'description',
    });
  });
});
