import type { ToOptions } from '@tanstack/react-router';
import type { JSX } from 'react';

import {
  TOOL_CATEGORIES,
  TOOL_DEFINITIONS,
  type ToolCategory,
} from './tool-catalog';

export interface ToolNavItem {
  category: ToolCategory;
  description: string;
  icon: JSX.Element;
  path: ToOptions['to'];
  slug: string;
  title: string;
}

// Order defines homepage grid + keyboard shortcuts (1..N) — keep stable.
const tools = TOOL_DEFINITIONS;

function buildNavItems(filter?: { mobile?: boolean }): Array<ToolNavItem> {
  return tools
    .filter((t) => (filter?.mobile ? t.showInMobile : true))
    .map((t) => ({
      category: t.category,
      description: t.description,
      icon: t.icon,
      path: `/${t.slug}` as ToOptions['to'],
      slug: t.slug,
      title: filter?.mobile ? (t.mobileTitle ?? t.pageTitle) : t.pageTitle,
    }));
}

const allNavItems = buildNavItems();

export function getToolNavItems(): Array<ToolNavItem> {
  return allNavItems;
}

export function getMobileNavItems(): Array<ToolNavItem> {
  return buildNavItems({ mobile: true });
}

export function getToolNavItem(slug: string): ToolNavItem | undefined {
  return allNavItems.find((item) => item.slug === slug);
}

export function getToolNavCategories(): Array<{
  category: ToolCategory;
  items: Array<ToolNavItem>;
}> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    items: allNavItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
