import { describe, expect, test } from 'vite-plus/test';

import { getToolNavItems } from '@/lib/navigation/tool-registry';

import { getHomepageData, HOMEPAGE_FEATURED_TOOL_COUNT } from './homepage-data';

describe('getHomepageData', () => {
  test('derives featured tools from the centralized registry', () => {
    const registryItems = getToolNavItems();
    const { featuredTools } = getHomepageData();

    expect(featuredTools).toEqual(
      registryItems.slice(0, HOMEPAGE_FEATURED_TOOL_COUNT)
    );
    expect(featuredTools.every((tool) => registryItems.includes(tool))).toBe(
      true
    );
  });

  test('exposes actionable route metadata for every homepage tool', () => {
    const { featuredTools } = getHomepageData();

    expect(
      featuredTools.every(
        (tool) =>
          tool.title.length > 0 &&
          tool.description.length > 0 &&
          typeof tool.path === 'string' &&
          tool.path.startsWith('/')
      )
    ).toBe(true);
  });
});
