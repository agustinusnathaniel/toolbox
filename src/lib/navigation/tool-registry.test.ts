import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vite-plus/test';

import { TOOL_CATEGORIES, TOOL_DEFINITIONS } from './tool-catalog';
import {
  getMobileNavItems,
  getToolNavCategories,
  getToolNavItems,
} from './tool-registry';

describe('getToolNavItems', () => {
  test('order is stable — it defines the homepage grid and keyboard shortcuts', () => {
    expect(getToolNavItems()[0].slug).toBe('wa-link-helper');
  });

  test('slugs are unique', () => {
    const items = getToolNavItems();
    const slugs = items.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('paths are unique', () => {
    const items = getToolNavItems();
    const paths = items.map((i) => i.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('getMobileNavItems', () => {
  test('orders by mobilePriority, not by catalog position', () => {
    const priorities = TOOL_DEFINITIONS.filter(
      (definition) => definition.showInMobile
    ).map((definition) => definition.mobilePriority);

    // A total order means the rendered bar can never depend on how the
    // catalog happens to be sorted for the homepage grid.
    expect(priorities.every((p) => p !== undefined)).toBe(true);
    expect(new Set(priorities).size).toBe(priorities.length);

    expect(getMobileNavItems().map((item) => item.slug)).toEqual(
      TOOL_DEFINITIONS.filter((definition) => definition.showInMobile)
        .slice()
        .sort((a, b) => (a.mobilePriority ?? 0) - (b.mobilePriority ?? 0))
        .map((definition) => definition.slug)
    );
  });

  test('ranks the tools that get a phone in their hands above the rest', () => {
    // QR Code and CSV were previously unreachable from the mobile bar because
    // the selection was positional and the first four won.
    const slugs = getMobileNavItems().map((item) => item.slug);
    expect(slugs).toContain('qrcode');
    expect(slugs).toContain('csv-converter');
  });

  test('stays within the bar bound', () => {
    expect(getMobileNavItems().length).toBeLessThanOrEqual(6);
  });

  test('maps mobile labels with a page title fallback', () => {
    const bySlug = new Map(
      TOOL_DEFINITIONS.map((definition) => [definition.slug, definition])
    );

    for (const item of getMobileNavItems()) {
      const definition = bySlug.get(item.slug);
      expect(item.title).toBe(definition?.mobileTitle ?? definition?.pageTitle);
    }
  });
});

describe('getToolNavCategories', () => {
  test('groups every tool into a category', () => {
    const categories = getToolNavCategories();
    const total = categories.reduce(
      (sum, group) => sum + group.items.length,
      0
    );
    expect(total).toBe(getToolNavItems().length);
  });

  test('categories follow TOOL_CATEGORIES display order', () => {
    const categories = getToolNavCategories();
    expect(categories.map((g) => g.category)).toEqual([...TOOL_CATEGORIES]);
  });

  test('each category has at least one tool', () => {
    for (const group of getToolNavCategories()) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});

describe('catalog completeness', () => {
  test('every tool route directory is registered in TOOL_DEFINITIONS', () => {
    const toolsDir = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../routes/_tools'
    );
    const routeDirectories = readdirSync(toolsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    const catalogSlugs = TOOL_DEFINITIONS.map((definition) => definition.slug);

    expect(new Set(routeDirectories)).toEqual(new Set(catalogSlugs));
  });
});
