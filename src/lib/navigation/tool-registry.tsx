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
  const source = tools.filter((t) => (filter?.mobile ? t.showInMobile : true));

  // The mobile bar is a fixed 4 slots, so selection has to be an explicit
  // decision rather than "whatever the catalog happens to list first". Rank by
  // mobilePriority; definitions without one sort last, then fall back to
  // catalog order so the homepage grid order is still deterministic.
  const ordered = filter?.mobile
    ? source
        .map((definition, index) => ({ definition, index }))
        .sort((a, b) => {
          const pa = a.definition.mobilePriority ?? Number.MAX_SAFE_INTEGER;
          const pb = b.definition.mobilePriority ?? Number.MAX_SAFE_INTEGER;
          if (pa !== pb) {
            return pa - pb;
          }
          return a.index - b.index;
        })
        .map((entry) => entry.definition)
    : source;

  return ordered.map((t) => ({
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

export function getToolNavCategories(): Array<{
  category: ToolCategory;
  items: Array<ToolNavItem>;
}> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    items: allNavItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
