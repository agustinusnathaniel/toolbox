import { useLocation } from '@tanstack/react-router';

import type { ToolCategory } from '@/lib/navigation/tool-catalog';
import type { ToolNavItem } from '@/lib/navigation/tool-registry';

/**
 * Returns true when the dev-only worst-case dataset is requested via
 * `?data=worst`. Production builds never honor it: the transform functions
 * below no-op outside `import.meta.env.DEV`.
 */
export function useWorstCaseMode(): boolean {
  // Subscribe to location so toggling the query re-renders consumers.
  useLocation({ select: (s) => s.href });
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return false;
  }
  try {
    return new URLSearchParams(window.location.search).get('data') === 'worst';
  } catch {
    return false;
  }
}

type WorstOverride = {
  slug: string;
  title?: string;
  description?: string;
};

/**
 * One dataset, many failures: each row carries a different realistic
 * worst case (long compound, CJK, RTL, emoji/script injection, empty
 * description, unbreakable URL, 2000-char description, diacritics), the
 * way real data mixes them. Slugs, paths, icons and categories are
 * preserved so navigation keeps working.
 */

// Built lazily so production bundles never include the worst-case strings:
// the module-level Map construction would otherwise survive treeshaking
// as a side effect even though every consumer no-ops outside DEV.
let overridesBySlug: Map<string, WorstOverride> | null = null;

function getOverrides(): Map<string, WorstOverride> {
  if (overridesBySlug === null) {
    // Array lives in the DEV branch so production minification drops the
    // worst-case strings entirely instead of shipping them as dead code.
    const dataset: Array<WorstOverride> = import.meta.env.DEV
      ? [
          {
            description:
              'Benachrichtigungseinstellungen und Datenschutzoptionen für JSON-Dokumente mit sehr langen zusammengesetzten Bezeichnungen ohne Umbruchpunkte.',
            slug: 'json-formatter',
            title: 'Donaudampfschifffahrtseinstellungsgesellschaftsverordnung',
          },
          {
            description: '',
            slug: 'yaml-converter',
            title: 'Zippy 画像圧縮',
          },
          {
            description:
              'Renders <b>bold</b> &amp; <script>alert(1)</script> as text.',
            slug: 'color-converter',
            title: 'نور الهدى عبد الرحمن',
          },
          {
            description:
              'Full thread at https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved including repro steps that never wrap.',
            slug: 'ua-check',
            title: 'Konstantin Oberhauser-Wettstein',
          },
          {
            description:
              'Formats, validates, and repairs structured payloads with source maps, path filtering, key sorting, duplicate detection, and streaming for large files. '.repeat(
                20
              ),
            slug: 'url-codec',
            title: 'URL Encoder & Decoder 🦊 Fox',
          },
          {
            description: 'Chuyển đổi màu sắc với dấu thanh điệu tiếng Việt.',
            slug: 'qrcode',
            title: 'Seán O\u2019Brien-Ó Súilleabháin',
          },
          {
            description: '   ',
            slug: 'js-perf',
            title: 'Jo',
          },
          {
            description:
              'bartholomew.fitzgerald@northwind-industries-holdings.example.com',
            slug: 'add-to-calendar',
            title: 'Christopher Alexander Montgomery III',
          },
        ]
      : [];
    overridesBySlug = new Map(dataset.map((o) => [o.slug, o]));
  }
  return overridesBySlug;
}

function applyOverride(item: ToolNavItem): ToolNavItem {
  const override = getOverrides().get(item.slug);
  if (!override) {
    return item;
  }
  return {
    ...item,
    description: override.description ?? item.description,
    title: override.title ?? item.title,
  };
}

/** Worst-case variant of `getToolNavItems()` for the command palette. */
export function getWorstCaseNavItems(
  items: Array<ToolNavItem>,
  active: boolean
): Array<ToolNavItem> {
  if (!(import.meta.env.DEV && active)) {
    return items;
  }
  return items.map(applyOverride);
}

/** Worst-case variant of `getToolNavCategories()` for the sidebar. */
export function getWorstCaseNavCategories(
  groups: Array<{ category: ToolCategory; items: Array<ToolNavItem> }>,
  active: boolean
): Array<{ category: ToolCategory; items: Array<ToolNavItem> }> {
  if (!(import.meta.env.DEV && active)) {
    return groups;
  }
  return groups.map((group) => ({
    ...group,
    items: group.items.map(applyOverride),
  }));
}
