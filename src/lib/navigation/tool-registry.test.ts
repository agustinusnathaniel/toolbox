import { describe, expect, test } from 'vite-plus/test';

import {
  getToolNavCategories,
  getToolNavItem,
  getToolNavItems,
  TOOL_CATEGORIES,
} from './tool-registry';

describe('getToolNavItems', () => {
  test('returns all registered tools', () => {
    const items = getToolNavItems();
    expect(items).toHaveLength(12);
  });

  test('each item has required fields', () => {
    const items = getToolNavItems();
    for (const item of items) {
      expect(item.slug).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.path).toBeTruthy();
      expect(item.icon).toBeDefined();
      expect(item.category).toBeTruthy();
    }
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

  test('keyboard shortcut index maps to correct tool', () => {
    const items = getToolNavItems();
    expect(items[0].slug).toBe('wa-link-helper');
    expect(items[1].slug).toBe('color-converter');
    expect(items[2].slug).toBe('json-formatter');
    expect(items[3].slug).toBe('zippy-img');
    expect(items[4].slug).toBe('ua-check');
    expect(items[5].slug).toBe('qrcode');
    expect(items[6].slug).toBe('js-perf');
    expect(items[7].slug).toBe('add-to-calendar');
    expect(items[8].slug).toBe('ev-charging');
    expect(items[9].slug).toBe('base64');
    expect(items[10].slug).toBe('password-generator');
    expect(items[11].slug).toBe('hash-generator');
  });
});

describe('getToolNavItem', () => {
  test('returns item for valid slug', () => {
    const item = getToolNavItem('wa-link-helper');
    expect(item).toBeDefined();
    expect(item?.title).toBeTruthy();
  });

  test('returns undefined for invalid slug', () => {
    expect(getToolNavItem('nonexistent')).toBeUndefined();
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
