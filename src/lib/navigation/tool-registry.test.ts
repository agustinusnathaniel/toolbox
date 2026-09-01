import { describe, expect, test } from 'vite-plus/test';

import { TOOL_CATEGORIES, TOOL_DEFINITIONS } from './tool-catalog';
import {
  getMobileNavItems,
  getToolNavCategories,
  getToolNavItem,
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
  test('derives items from mobile-enabled definitions within the nav bound', () => {
    const items = getMobileNavItems();
    const mobileDefinitions = TOOL_DEFINITIONS.filter(
      (definition) => definition.showInMobile
    );

    expect(items.map((item) => item.slug)).toEqual(
      mobileDefinitions.map((definition) => definition.slug)
    );
    expect(items.length).toBeLessThanOrEqual(6);
  });

  test('maps mobile labels with a page title fallback', () => {
    const items = getMobileNavItems();

    expect(items.map((item) => item.title)).toEqual(
      TOOL_DEFINITIONS.filter((definition) => definition.showInMobile).map(
        (definition) => definition.mobileTitle ?? definition.pageTitle
      )
    );
  });

  test('returns unique paths', () => {
    const paths = getMobileNavItems().map((item) => item.path);

    expect(new Set(paths).size).toBe(paths.length);
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
